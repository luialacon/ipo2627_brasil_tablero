import { Modelo } from './modelo.js';
import { Vista } from './vista.js';
import { Controlador } from './controlador.js';

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new Controlador(new Modelo(), new Vista());
});
