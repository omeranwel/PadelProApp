import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <PageWrapper>
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="text-[120px] font-bold text-accent-orange/20 font-display leading-none mb-4 select-none">404</div>
          <h1 className="text-4xl font-bold font-display mb-4">Out of Bounds</h1>
          <p className="text-text-secondary text-lg mb-10">The page you're looking for has gone out of play. Let's get you back on the court.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/')}>Back to Home</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/courts')}>Find a Court</Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
export default NotFound;
