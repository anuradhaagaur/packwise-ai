import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { Copy, Check, Share2, Link, Globe } from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  commodityName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  commodityName,
}) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/results/${analysisId}` : `/results/${analysisId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success('Share link copied to clipboard', shareUrl);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Packaging Analysis"
      description={`Generate a secure view-only link for ${commodityName} packaging assessment.`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
          <Globe className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Public Assessment Link
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
              {shareUrl}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopy} className="w-full text-xs font-semibold">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
