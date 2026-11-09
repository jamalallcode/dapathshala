import React from 'react';
import { InstitutionPaper } from '../../lib/institutionPapers';
import { InstitutionPaperExplorer } from './InstitutionPaperExplorer';

interface InstitutionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaper: (paper: InstitutionPaper) => void;
}

export const InstitutionPaperModal: React.FC<InstitutionPaperModalProps> = ({
  isOpen,
  onClose,
  onSelectPaper
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-white overflow-y-auto p-4 sm:p-6 animate-in fade-in">
      <div className="max-w-7xl mx-auto">
        <InstitutionPaperExplorer
          onSelectPaper={(p) => {
            onSelectPaper(p);
            onClose();
          }}
          onBack={onClose}
        />
      </div>
    </div>
  );
};
