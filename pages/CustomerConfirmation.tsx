
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

const CustomerConfirmation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout title="Success!">
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Created!</h2>
        <p className="text-slate-500 mb-8 px-4">
          Please show your Order ID to the receptionist to finalize your drop-off.
        </p>

        <div className="bg-slate-50 border-2 border-dashed border-sky-200 rounded-2xl p-8 mb-8 w-full">
           <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Your Order ID</p>
           <p className="text-4xl font-mono font-black text-sky-600 tracking-tighter">{id}</p>
        </div>

        <div className="space-y-4 w-full">
          <div className="bg-white border border-slate-100 rounded-xl p-4 text-left shadow-sm">
            <h4 className="font-bold text-slate-700 mb-1">Next Steps:</h4>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
              <li>Hand over items to our staff.</li>
              <li>Pay the advance deposit.</li>
              <li>Wait for pickup notification.</li>
            </ul>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerConfirmation;
