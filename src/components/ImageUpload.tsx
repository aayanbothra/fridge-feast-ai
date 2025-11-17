import { useState, useRef } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageAnalyzed: (ingredients: any[]) => void;
  isAnalyzing: boolean;
}

const ImageUpload = ({ onImageAnalyzed, isAnalyzing }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Call Claude API to analyze image
    // For now, simulate analysis
    setTimeout(() => {
      const mockIngredients = [
        { name: 'tomatoes', category: 'produce', quantity: '3' },
        { name: 'onion', category: 'produce', quantity: '1' },
        { name: 'garlic', category: 'produce', quantity: '4 cloves' },
        { name: 'chicken breast', category: 'protein', quantity: '2' },
        { name: 'olive oil', category: 'spice', quantity: '2 tbsp' },
      ];
      onImageAnalyzed(mockIngredients);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative border-2 border-dashed rounded-2xl p-12
          transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-primary/30 hover:border-primary/60 hover:bg-muted/30'
          }
          ${isAnalyzing ? 'pointer-events-none opacity-60' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview && !isAnalyzing ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-center text-sm text-muted-foreground">
              Click to upload a different image
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <p className="text-lg font-medium text-foreground">
                  Analyzing your ingredients...
                </p>
                <p className="text-sm text-muted-foreground">
                  This may take a few seconds
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center gap-4">
                  <Upload className="w-12 h-12 text-primary" />
                  <Camera className="w-12 h-12 text-secondary" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">
                    Upload a photo of your ingredients
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to select • Take a photo on mobile
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="default" size="lg" className="bg-accent hover:bg-accent/90">
                    Choose File
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
