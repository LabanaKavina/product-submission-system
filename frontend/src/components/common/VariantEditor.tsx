import { useRef, ChangeEvent } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Card, { CardHeader, CardBody } from '../ui/Card';
import { VariantFormData, ProductFormErrors } from '../../types/form';
import { ALLOWED_IMAGE_TYPES } from '../../utils/constants';
import { getImageUrl } from '../../utils/image';

interface VariantEditorProps {
  variants: VariantFormData[];
  errors: ProductFormErrors['variants'];
  onChange: (updated: VariantFormData[]) => void;
  onErrorsChange: (updated: ProductFormErrors['variants']) => void;
}

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export default function VariantEditor({
  variants,
  errors,
  onChange,
  onErrorsChange,
}: VariantEditorProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function updateVariant(index: number, patch: Partial<VariantFormData>) {
    const updated = [...variants];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  }

  function updateVariantError(index: number, patch: Partial<ProductFormErrors['variants'][number]>) {
    const updated = [...errors];
    updated[index] = { ...updated[index], ...patch };
    onErrorsChange(updated);
  }

  function handleAdd() {
    onChange([...variants, { name: '', price: '', image: null, previewUrl: null, existingImagePath: null }]);
    onErrorsChange([...errors, {}]);
  }

  function handleRemove(index: number) {
    const removed = variants[index];
    if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange(variants.filter((_, i) => i !== index));
    onErrorsChange(errors.filter((_, i) => i !== index));
  }

  function handleFieldChange(index: number, field: 'name' | 'price', value: string) {
    updateVariant(index, { [field]: value });
  }

  function handleImageChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    const prev = variants[index];
    if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
    updateVariant(index, { image: file, previewUrl: file ? URL.createObjectURL(file) : null });
    if (file && !ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      updateVariantError(index, { image: 'Image must be JPEG, PNG, or WebP' });
    } else {
      updateVariantError(index, { image: undefined });
    }
  }

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Variants</h2>
          <p className="text-xs text-gray-400 mt-0.5">Each variant needs a name, price and image</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
          <PlusIcon /> Add Variant
        </Button>
      </div>

      {variants.map((variant, index) => {
        const hasPreview   = !!variant.previewUrl;
        const hasExisting  = !!variant.existingImagePath && !variant.image;
        const displayImage = hasPreview
          ? variant.previewUrl!
          : hasExisting
          ? getImageUrl(variant.existingImagePath!)
          : null;

        return (
          <Card key={index}>
            <CardHeader className="py-2.5 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {variant.name.trim() || `Variant ${index + 1}`}
                  </span>
                </div>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardBody className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Variant Name"
                  value={variant.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  error={errors[index]?.name}
                  placeholder="e.g. Red / Large"
                />
                <Input
                  label="Price (₹)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                  error={errors[index]?.price}
                  placeholder="0.00"
                  leftIcon={<span className="text-gray-400 text-sm font-medium">₹</span>}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">Image</label>
                <div className="flex items-start gap-4">

                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    aria-label="Upload image"
                    className={`flex flex-col items-center justify-center w-24 h-24 shrink-0 rounded-xl border-2 border-dashed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 overflow-hidden ${
                      errors[index]?.image
                        ? 'border-red-300 bg-red-50 hover:bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
                    }`}
                  >
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={`Preview for variant ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <>
                        <UploadIcon className={`w-7 h-7 mb-1 ${errors[index]?.image ? 'text-red-300' : 'text-gray-300'}`} />
                        <span className={`text-[10px] font-medium ${errors[index]?.image ? 'text-red-400' : 'text-gray-400'}`}>
                          Upload
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-xs font-medium text-gray-700 mb-0.5 truncate">
                      {variant.image
                        ? variant.image.name
                        : hasExisting
                        ? 'Current image (click to replace)'
                        : 'No file chosen'}
                    </p>
                    <p className="text-xs text-gray-400 mb-1.5">JPEG, PNG or WebP · max 5 MB</p>
                    {hasExisting && !variant.image && (
                      <Badge label="Using existing image" variant="submitted" dot={false} />
                    )}
                    {hasPreview && (
                      <Badge label="New image selected" variant="info" dot={false} />
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    onChange={(e) => handleImageChange(index, e)}
                    className="hidden"
                    aria-invalid={!!errors[index]?.image}
                    aria-describedby={errors[index]?.image ? `variant-${index}-image-error` : undefined}
                  />
                </div>

                {errors[index]?.image && (
                  <p id={`variant-${index}-image-error`} className="mt-2 text-xs text-red-600 flex items-center gap-1" role="alert">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {errors[index].image}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}

      {variants.length > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleAdd}
          className="w-full border-dashed"
        >
          <PlusIcon /> Add another variant
        </Button>
      )}
    </div>
  );
}
