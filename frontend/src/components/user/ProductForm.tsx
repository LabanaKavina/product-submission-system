import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Card, { CardHeader, CardBody } from '../ui/Card';
import VariantEditor from '../common/VariantEditor';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { ProductWithVariants } from '../../types/product';
import { VariantFormData, ProductFormErrors, emptyFormErrors } from '../../types/form';
import { validateProductForm } from '../../utils/validation';
import { ALLOWED_IMAGE_TYPES } from '../../utils/constants';
import { InlineError } from '../common/PageStatus';

const DocIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function ProductForm() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [productName, setProductName]   = useState('');
  const [description, setDescription]   = useState('');
  const [variants, setVariants]         = useState<VariantFormData[]>([{ name: '', price: '', image: null, previewUrl: null }]);
  const [errors, setErrors]             = useState<ProductFormErrors>(emptyFormErrors(1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const isFormValid =
    productName.trim().length > 0 &&
    description.trim().length > 0 &&
    variants.length > 0 &&
    variants.every(
      (v) =>
        v.name.trim().length > 0 &&
        v.price.trim().length > 0 &&
        parseFloat(v.price) > 0 &&
        v.image !== null &&
        ALLOWED_IMAGE_TYPES.includes(v.image.type as any)
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const { errors: validationErrors, isValid } = validateProductForm(productName, description, variants, true);
    if (!isValid) { setErrors(validationErrors); return; }

    setErrors(emptyFormErrors(variants.length));
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', productName.trim());
      formData.append('description', description.trim());
      variants.forEach((v, i) => {
        formData.append(`variants[${i}][name]`, v.name.trim());
        formData.append(`variants[${i}][price]`, v.price.trim());
        if (v.image) formData.append('images', v.image);
      });
      await apiRequest<ProductWithVariants>('/api/products', { method: 'POST', body: formData }, token ?? undefined);
      navigate('/user/products');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/products')} className="mb-4 -ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to products
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <p className="mt-1 text-sm text-gray-500">Fill in the details below and add at least one variant.</p>
      </div>

      <form id="product-form" onSubmit={handleSubmit} noValidate>
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
                  onChange={(e) => setProductName(e.target.value)}
                  error={errors.name}
                  placeholder="e.g. Classic Leather Bag"
                  required
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={errors.description}
                  placeholder="Describe your product — materials, features, intended use…"
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

        {submitError && <div className="mt-6"><InlineError message={submitError} /></div>}
        <div className="h-20" />
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400 hidden sm:block">
            All fields must be filled before submitting.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button type="button" variant="secondary" onClick={() => navigate('/user/products')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button form="product-form" type="submit" variant="primary" isLoading={isSubmitting} disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Product'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
