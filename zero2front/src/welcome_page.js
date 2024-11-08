import React from 'react';

export default function Welcome() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Mi Vista</h1>
      <p className="mb-4">Esta es una vista de ejemplo creada en React.</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Haz clic aquí
      </button>
    </div>
  );
}