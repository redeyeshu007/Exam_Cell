import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to = "/" }) => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(to)}
      className="modern-back-btn"
      title="Go Back"
    >
      <ArrowLeft size={20} />
      <span className="hide-mobile">Back to Hub</span>
    </button>
  );
};

export default BackButton;
