import React from 'react';
import ProductDefinitionForm from '@/components/ProductDefinitionForm';

const DefineProductPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">定义你的产品</h1>
      <ProductDefinitionForm onComplete={() => {}} />
    </div>
  );
};

export default DefineProductPage; 