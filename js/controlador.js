/**
 * Controlador de la aplicación Tablero
 * Conecta las acciones del usuario de la Vista con la lógica del Modelo.
 */
export class Controlador {
    constructor(modelo, vista) {
        this.modelo = modelo;
        this.vista = vista;

        this.tamano = 'mediana';
        this.formas = 'geometrico';
        this.colores = 'neon';

        // Eventos
        this.vista.vincularAjustes(this.nuevaPartida.bind(this));
        this.vista.vincularArrastre(this.intentarIntercambio.bind(this));

        // Iniciar Partida por defecto (3x3)
        this.nuevaPartida(3, 'mediana', 'geometrico', 'neon');
    }

    nuevaPartida(dimension, tamano, formas, colores) {
        this.tamano = tamano;
        this.formas = formas;
        this.colores = colores;
        this.vista.ocultarVictoria();

        this.modelo.iniciarTablero(dimension);
        this.vista.actualizarCampoDimension(this.modelo.dimension);
        this.vista.pintarTablero(this.modelo.tablero, this.tamano, this.formas, this.colores);
    }

    intentarIntercambio(f1, c1, f2, c2) {
        // Soltar la ficha en su propia celda no es un movimiento
        if (f1 === f2 && c1 === c2) return;

        // Solo permite el intercambio si las celdas son contiguas
        if (!this.modelo.sonContiguas(f1, c1, f2, c2)) {
            this.vista.mostrarAviso('⚠ Solo puedes intercambiar una ficha con otra contigua (arriba, abajo, izquierda o derecha)');
            return;
        }

        this.modelo.intercambiarFichas(f1, c1, f2, c2);
        this.vista.pintarTablero(this.modelo.tablero, this.tamano, this.formas, this.colores);

        if (this.modelo.hayVictoria()) {
            setTimeout(() => this.vista.mostrarVictoria(), 150);
        }
    }
}
