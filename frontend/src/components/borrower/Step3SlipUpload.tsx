import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, ArrowRight, ArrowLeft, Cloud, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  onNext: (fileUrl: string) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step3SlipUpload: React.FC<Props> = ({ onNext, onBack, initialData }) => {
  const [fileName, setFileName] = useState<string | null>(
    initialData?.salarySlipUrl ? initialData.salarySlipUrl.split('/').pop() : null
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialData?.salarySlipUrl || null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = async (file: File) => {
    setFileName(file.name);
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/borrower/upload-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedUrl(res.data.fileUrl);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'File not stored: Cloudinary API sent an upload error.';
      setError(errorMessage);
      setFileName(null);
      setUploadedUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleContinue = () => {
    if (!uploadedUrl) {
      setError('Please upload a valid document to continue.');
      return;
    }
    onNext(uploadedUrl);
  };

  const isImage = uploadedUrl ? /\.(jpeg|jpg|png|gif|webp)$/i.test(uploadedUrl) || uploadedUrl.includes('image') : false;

  return (
    <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto animate-fade-in-up">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-slate-800">Upload Salary Slip / Proof</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">Please provide your recent 3 months payslip (PDF/PNG/JPG)</p>
      </div>

      {/* Explicit On-Screen Error Alert Banner */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        type="file"
        id="slip-upload"
        accept=".pdf,.png,.jpeg,.jpg,image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* CONDITION 1: SHOW EXPANDED TALL UPLOAD DROPZONE ONLY IF NO FILE IS UPLOADED OR WHEN UPLOADING */}
      {(!uploadedUrl || uploading) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl py-14 px-8 min-h-[260px] flex flex-col justify-center items-center text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-blue-600 bg-blue-50/80 scale-[1.02] shadow-lg shadow-blue-500/20'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <label htmlFor="slip-upload" className="cursor-pointer flex flex-col items-center">
            <div className={`p-4 rounded-2xl mb-4 transition-transform ${isDragging ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 text-blue-600 shadow-sm'}`}>
              <Upload className="w-10 h-10" />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">
              {isDragging ? 'Drop file here to upload!' : 'Click to browse or drop file here'}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1.5 max-w-xs leading-relaxed">
              Direct Cloudinary Cloud Upload • Supports PDF, PNG, JPG (Up to 10MB)
            </span>
          </label>
        </div>
      )}

      {uploading && (
        <div className="p-3.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-xl flex items-center gap-2 animate-fade-in-up">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Uploading salary slip to Cloud Storage...
        </div>
      )}

      {/* CONDITION 2: ONCE UPLOADED, REMOVE UPLOAD ICON & SHOW AUTOMATIC LIVE DOCUMENT PREVIEW */}
      {uploadedUrl && !uploading && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Header Status Bar with Re-upload Button */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-extrabold text-slate-900 truncate max-w-[200px]">{fileName}</p>
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <Cloud className="w-3 h-3 text-cyan-600" /> Cloudinary Uploaded & Verified
                </p>
              </div>
            </div>

            <label
              htmlFor="slip-upload"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Change File
            </label>
          </div>

          {/* Automatic Live Document Preview Container */}
          <div className="bg-slate-900/5 p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[260px] max-h-[340px] overflow-hidden relative shadow-inner">
            {isImage ? (
              <img
                src={uploadedUrl}
                alt="Uploaded Salary Slip Live Preview"
                className="max-h-[300px] w-auto object-contain rounded-xl shadow-md border border-white"
              />
            ) : (
              <iframe
                src={uploadedUrl}
                title="Salary Slip PDF Live Preview"
                className="w-full h-[300px] rounded-xl border border-slate-200 shadow-sm"
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!uploadedUrl || uploading}
          className="w-2/3 py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
        >
          Proceed to Terms <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
