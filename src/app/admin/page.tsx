'use client';

import React, { useState } from 'react';

interface CodeItem {
  _id: string;
  code: string;
  note: string;
  isUsed: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [note, setNote] = useState('');
  const [isGenLoading, setIsGenLoading] = useState(false);

  // توليد كود جديد فوراً وبشكل محلي 100%
  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenLoading(true);

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomCode = 'CV-';
    for (let i = 0; i < 8; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCode: CodeItem = {
      _id: Date.now().toString(),
      code: randomCode,
      note: note.trim() || 'Client Code',
      isUsed: false,
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    // إضافة الكود مباشرة إلى القائمة في الواجهة
    setCodes((prev) => [newCode, ...prev]);
    setNote('');
    setIsGenLoading(false);
  };

  const totalCodes = codes.length;
  const activeCodes = codes.filter((c) => !c.isUsed).length;
  const redeemedCodes = codes.filter((c) => c.isUsed).length;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
       
        {/* الهيدر */}
        <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '10px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Admin Control Panel</h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Manage your client subscription codes</p>
        </div>

        {/* كروت الإحصائيات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '32px' }}>{totalCodes}</h1>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>TOTAL CODES</span>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#38bdf8' }}>{activeCodes}</h1>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>ACTIVE (UNUSED)</span>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#a855f7' }}>{redeemedCodes}</h1>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>REDEEMED (USED)</span>
          </div>
        </div>

        {/* قسم الإنشاء وعرض الأكواد */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
         
          {/* فورم توليد كود */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
            <h3>Generate New Code</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Create a single-use code for your clients.</p>
            <form onSubmit={handleGenerateCode}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>
                CLIENT NOTE / NAME
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Ahmed"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  marginBottom: '15px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={isGenLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {isGenLoading ? 'Generating...' : '+ Create Unlock Code'}
              </button>
            </form>
          </div>

          {/* جدول عرض الأكواد */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
            <h3>Codes Directory</h3>
            {codes.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                No generated codes found. Generate one on the left to start!
              </p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {codes.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      borderLeft: '4px solid #38bdf8'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#38bdf8' }}>{item.code}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.note} • {item.createdAt}</div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.code)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#334155',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
