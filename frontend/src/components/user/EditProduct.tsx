import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import Card, { CardHeader, CardBody } from '../ui/Card';
import VariantEditor from '../common/VariantEditor';
import { LoadingState, InlineError } from '../common/PageStatus';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { ProductWithVariants } from '../../types/product';
import { VariantFormData, ProductFormErrors, emptyFormErrors } from '../../types/form';
import { validateProductForm } from '../../utils/validation';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready' };

const DocIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function EditProduct() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { token } = useAuth();

  const [loadState, setLoadState]   = useState<LoadState>({ status: 'loading' });
  const [fields, setFields]         = useState({ productName: '', description: '' });
  const [variants, setVariants]     = useState<VariantFormData[]>([]);
  const [errors, setErrors]         = useState<ProductFormErrors>(emptyFormErrors());
  const [submitState, setSubmitState] = useState({ isSubmitting: false, error: null as string | null });

  const { productName, description } = fields;

  useEffect(() => {
    return () => { variants.forEach((v) => { if (v.previewUrl) URL.revokeObjectURL(v.previewUrl); }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoadState({ status: 'loading' });
    try {
      const data = await apiRequest<ProductWithVariants>(`/api/products/${id}`, {}, token ?? undefined);
      if (data.status !== 'Submitted') {
        setLoadState({ status: 'error', message: `This product cannot be edited because its status is "${data.status}". Only "Submitted" products can be edited.` });
        return;
      }
      setFields({ productName: data.name ?? '', description: data.description ?? '' });
      setVariants((data.variants ?? []).map((v) => ({
        name: v.name ?? '',
        price: String(v.price ?? ''),
        image: null,
        previewUrl: null,
        existingImagePath: v.imagePath ?? null,
      })));
      setErrors(emptyFormErrors((data.variants ?? []).length));
      setLoadState({ status: 'ready' });
    } catch (err) {
      setLoadState({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load product' });
    }
  }, [id, token]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ isSubmitting: false, error: null });
    const { errors: validationErrors, isValid } = validateProductForm(productName, description, variants, false);
    if (!isValid) { setErrors(validationErrors); return; }
    setErrors(emptyFormErrors(variants.length));
    setSubmitState({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('name', productName.trim());
      formData.append('description', description.trim());
      variants.forEach((v, i) => {
        formData.append(`variants[${i}][name]`, v.name.trim());
        formData.append(`variants[${i}][price]`, v.price.trim());
        if (v.image) {
          formData.append('images', v.image);
        } else if (v.existingImagePath) {
          formData.append(`variants[${i}][existingImagePath]`, v.existingImagePath);
        }
      });
      await apiRequest<ProductWithVariants>(`/api/products/${id}`, { method: 'PUT', body: formData }, token ?? undefined);
      navigate(`/user/products/${id}`);
    } catch (err) {
      setSubmitState({ isSubmitting: false, error: err instanceof Error ? err.message : 'Failed to update product' });
    } finally {
      setSubmitState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (loadState.status === 'loading') return <LoadingState fullScreen />;

  if (loadState.status === 'error') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/user/products/${id}`)} className="-ml-2 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to product
        </Button>
        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-0.5">Cannot edit this product</h3>
                <p className="text-sm text-red-700">{loadState.message}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/user/products/${id}`)} className="-ml-2 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to product
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <Badge label="Draft" variant="submitted" size="sm" />
        </div>
        <p className="mt-1 text-sm text-gray-500">Update the details below. Changes are saved when you click "Save Changes".</p>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700">
                    <DocIcon />
                  </span>
                  <h2 className="text-sm font-semibold text-gray-700">Product Information</h2>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <Input
                  label="Product Name"
                  value={productName}
                  onChange={(e) => setFields(f => ({ ...f, productName: e.target.value }))}
                  error={errors.name}
                  placeholder="e.g. Classic Leather Bag"
                  required
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setFields(f => ({ ...f, description: e.target.value }))}
                  error={errors.description}
                  placeholder="Describe your product…"
                  rows={6}
                />
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <VariantEditor
              variants={variants}
              errors={errors.variants}
              onChange={setVariants}
              onErrorsChange={(updated) => setErrors((prev) => ({ ...prev, variants: updated }))}
            />
          </div>
        </div>

        {submitState.error && <div className="mt-6"><InlineError message={submitState.error} /></div>}
        <div className="h-20" />
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 hidden sm:block">Saving will update the product and keep it in "Submitted" status.</p>
          <div className="flex items-center gap-3 ml-auto">
            <Button type="button" variant="secondary" onClick={() => navigate(`/user/products/${id}`)} disabled={submitState.isSubmitting}>
              Cancel
            </Button>
            <Button form="edit-product-form" type="submit" variant="primary" isLoading={submitState.isSubmitting}>
              {submitState.isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
