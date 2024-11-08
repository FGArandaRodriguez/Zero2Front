import React from "react";

export default function login(){
    const handlerSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (user_name === 'admin' && password === '123'){
            alert ('inicio de sesion exitoso')
        } else {
            //alert('error, usuario o contraseña incorrecta')
            setError('error, usuario o contraseña incorrecta')
        }
    };

    return(

        //poner todo tu html como si fueras a programar en HTML PURO
        <div></div>

    );
}