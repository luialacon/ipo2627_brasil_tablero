import { Model } from './model.js';
import { View } from './view.js';
import { Controller } from './controller.js';

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new Controller(new Model(), new View());
});