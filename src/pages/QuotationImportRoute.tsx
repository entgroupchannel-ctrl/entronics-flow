import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuotationImport from './QuotationImport';

export default function QuotationImportRoute() {
  return (
    <Routes>
      <Route path="/" element={<QuotationImport />} />
    </Routes>
  );
}