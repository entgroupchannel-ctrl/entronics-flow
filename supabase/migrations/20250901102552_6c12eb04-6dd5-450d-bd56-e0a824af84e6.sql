-- Add is_software field to products table for marking software products
ALTER TABLE public.products 
ADD COLUMN is_software boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering software products
CREATE INDEX idx_products_is_software ON public.products(is_software);

-- Add comment for documentation
COMMENT ON COLUMN public.products.is_software IS 'Indicates if the product is software (subject to 3% withholding tax)';