import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertTriangle } from 'lucide-react';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="not-found-code">404</h1>
        </div>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="not-found-button">
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
};

