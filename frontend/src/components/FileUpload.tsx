import { useState, useRef, type ChangeEvent, useId } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, FileText, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    accept: string;
    label: string;
    onChange: (file: File | null) => void;
    value?: File | null;
    icon?: 'image' | 'file';
    maxSize?: number; // in MB
}

// Magic bytes for common file types
const FILE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

export function FileUpload({
    accept,
    label,
    onChange,
    value,
    icon = 'file',
    maxSize = 70,
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const Icon = icon === 'image' ? Image : FileText;

    // Validate file magic bytes for additional security
    const validateMagicBytes = async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 8);
                const signatures = FILE_SIGNATURES[file.type];
                
                if (!signatures) {
                    // If we don't have signatures for this type, skip check
                    resolve(true);
                    return;
                }

                const isValid = signatures.some(sig => 
                    sig.every((byte, index) => arr[index] === byte)
                );
                resolve(isValid);
            };
            reader.onerror = () => resolve(false);
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    };

    const validateFile = async (file: File): Promise<boolean> => {
        setError(null);
        
        // Check file size
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            setError(`File size must be less than ${maxSize}MB`);
            return false;
        }

        if (file.size === 0) {
            setError('File is empty');
            return false;
        }

        // Check file type by extension
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        const isAccepted = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
                return fileExtension === type.toLowerCase();
            }
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.replace('/*', ''));
            }
            return file.type === type;
        });

        if (!isAccepted) {
            setError('File type not supported');
            return false;
        }

        // Validate magic bytes for images and PDFs
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            const validMagicBytes = await validateMagicBytes(file);
            if (!validMagicBytes) {
                setError('Invalid file format. The file content doesn\'t match its type.');
                return false;
            }
        }

        return true;
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && await validateFile(file)) {
            onChange(file);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && await validateFile(file)) {
            onChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const clearFile = () => {
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setError(null);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="form-group">
            <label htmlFor={inputId} className="form-label">{label}</label>
            
            {value ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="file-upload"
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                    role="status"
                    aria-live="polite"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Icon size={24} style={{ color: 'var(--color-primary-400)' }} aria-hidden="true" />
                        <div>
                            <p style={{ margin: 0, fontWeight: 500, wordBreak: 'break-word' }}>
                                {value.name}
                            </p>
                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                                {formatFileSize(value.size)}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearFile}
                        className="btn btn-icon btn-ghost"
                        style={{ color: 'var(--color-error-500)' }}
                        aria-label={`Remove ${value.name}`}
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    className={`file-upload ${isDragOver ? 'dragover' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    whileHover={{ borderColor: 'var(--color-primary-400)' }}
                    role="button"
                    tabIndex={0}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                >
                    <input
                        ref={inputRef}
                        id={inputId}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        aria-label={label}
                    />
                    <Upload className="file-upload-icon" aria-hidden="true" />
                    <p className="file-upload-text">
                        <span>Click to upload</span> or drag and drop
                    </p>
                    <p style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-text-muted)', 
                        marginTop: 'var(--space-2)' 
                    }}>
                        Max file size: {maxSize}MB
                    </p>
                </motion.div>
            )}

            {error && (
                <motion.div
                    id={`${inputId}-error`}
                    className="form-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                    role="alert"
                >
                    <AlertCircle size={14} aria-hidden="true" />
                    {error}
                </motion.div>
            )}
        </div>
    );
}
