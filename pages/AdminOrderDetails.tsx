
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { getOrderSummary } from '../services/geminiService';

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [aiNote, setAiNote] = useState<string>('Generating internal summary...');
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [total, setTotal] = useState(0);
  const [advance, setAdvance] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    const found = data.find((o: Order) => o.id === id);
    if (found) {
      setOrder(found);
      setTotal(found.payment.total);
      setAdvance(found.payment.advance);
      getOrderSummary(found).then(setAiNote);
    }
  }, [id]);

  const updateOrder = (updatedFields: Partial<Order>) => {
    if (!order) return;
    const data = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = data.map((o: Order) => 
      o.id === id ? { ...o, ...updatedFields } : o
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrder({ ...order, ...updatedFields });
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrder({ status: newStatus });
  };

  const savePayment = () => {
    updateOrder({ 
      payment: { 
        total, 
        advance, 
        remaining: Math.max(0, total - advance) 
      } 
    });
    setIsEditingPayment(false);
  };

  if (!order) return <Layout title="Not Found" isAdmin>Order not found</Layout>;

  return (
    <Layout title={order.id} isAdmin showBack>
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex justify-between items-center">
           <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase">{order.customer.firstName} {order.customer.lastName}</h2>
              <p className="text-slate-500 font-medium">{order.customer.phone}</p>
           </div>
           <StatusBadge status={order.status} />
        </div>

        {/* AI Insight */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
           <div className="absolute right-[-10px] top-[-10px] opacity-10">
             <span className="text-8xl">✨</span>
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
             Staff Quick-Note
           </p>
           <p className="text-lg font-medium leading-tight relative z-10 italic">
             "{aiNote}"
           </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Items</p>
             <p className="text-xl font-bold text-slate-800">{order.details.itemCount}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Service</p>
             <p className="text-md font-bold text-slate-800 leading-tight">{order.details.serviceType}</p>
          </div>
        </div>

        {order.details.notes && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
             <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1">Customer Notes</p>
             <p className="text-sm text-yellow-900 font-medium">{order.details.notes}</p>
          </div>
        )}

        {/* Payment Logic */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <h4 className="font-bold text-slate-800">Financials</h4>
             <button 
               onClick={() => setIsEditingPayment(!isEditingPayment)}
               className="text-xs font-bold text-sky-600 hover:text-sky-700"
             >
               {isEditingPayment ? 'CANCEL' : 'EDIT'}
             </button>
           </div>

           {isEditingPayment ? (
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Total Cost (UZS)</label>
                   <input 
                     type="number" 
                     className="w-full border-b-2 border-slate-200 py-1 text-xl font-bold outline-none focus:border-sky-500"
                     value={total}
                     onChange={e => setTotal(parseInt(e.target.value))}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Advance Paid (UZS)</label>
                   <input 
                     type="number" 
                     className="w-full border-b-2 border-slate-200 py-1 text-xl font-bold outline-none focus:border-sky-500"
                     value={advance}
                     onChange={e => setAdvance(parseInt(e.target.value))}
                   />
                </div>
                <button 
                  onClick={savePayment}
                  className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl"
                >
                  Save Changes
                </button>
             </div>
           ) : (
             <div className="space-y-3">
               <div className="flex justify-between">
                 <span className="text-slate-500 text-sm">Total</span>
                 <span className="font-bold">{order.payment.total.toLocaleString()} UZS</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-500 text-sm">Advance</span>
                 <span className="font-bold text-green-600">-{order.payment.advance.toLocaleString()} UZS</span>
               </div>
               <div className="pt-3 border-t flex justify-between items-end">
                 <span className="text-slate-800 font-bold uppercase text-xs">Remaining</span>
                 <span className={`text-2xl font-black ${order.payment.remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                   {order.payment.remaining.toLocaleString()} UZS
                 </span>
               </div>
               {order.payment.remaining > 0 && order.status === OrderStatus.READY && (
                 <button 
                    onClick={() => updateOrder({ payment: { ...order.payment, advance: order.payment.total, remaining: 0 } })}
                    className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                 >
                   Clear Remaining Balance
                 </button>
               )}
             </div>
           )}
        </div>

        {/* Status Progression */}
        <div className="pt-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Change Workflow Status</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={order.status === OrderStatus.WASHING}
              onClick={() => handleStatusChange(OrderStatus.WASHING)}
              className={`py-4 rounded-xl font-bold transition-all ${order.status === OrderStatus.WASHING ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-amber-50'}`}
            >
              💧 Washing
            </button>
            <button 
              disabled={order.status === OrderStatus.READY}
              onClick={() => handleStatusChange(OrderStatus.READY)}
              className={`py-4 rounded-xl font-bold transition-all ${order.status === OrderStatus.READY ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-slate-100 text-slate-600 hover:bg-green-50'}`}
            >
              ✅ Ready
            </button>
          </div>
          <button 
            disabled={order.status === OrderStatus.DELIVERED}
            onClick={() => handleStatusChange(OrderStatus.DELIVERED)}
            className={`w-full py-4 rounded-xl font-bold transition-all ${order.status === OrderStatus.DELIVERED ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            📦 Mark as Delivered & Archive
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrderDetails;
