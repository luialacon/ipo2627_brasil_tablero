/**
 * Modelo de datos de la aplicación Tablero
 * Mantiene el estado del tablero NxN y evalúa las condiciones de victoria.
 */
export class Modelo {
    constructor() {
        this.dimension = 3;
        this.tablero = [];
    }

    /**
     * Inicializa un nuevo tablero NxN (limitado entre 3 y 10).
     * Genera una combinación resoluble asignando filas completas de tipos de fichas.
     * @param {number} dimension
     */
    iniciarTablero(dimension) {
        this.dimension = Math.min(10, Math.max(3, dimension));
        this.tablero = [];

        const fichas = [];
        const tiposPorFila = [1, 2, 3];

        for (let f = 3; f < this.dimension; f++) {
            tiposPorFila.push(Math.floor(Math.random() * 3) + 1);
        }

        tiposPorFila.forEach(tipo => {
            for (let c = 0; c < this.dimension; c++) {
                fichas.push(tipo);
            }
        });

        for (let i = fichas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fichas[i], fichas[j]] = [fichas[j], fichas[i]];
        }

        for (let f = 0; f < this.dimension; f++) {
            const fila = fichas.slice(f * this.dimension, (f + 1) * this.dimension);
            this.tablero.push(fila);
        }
    }

    /**
     * Verifica si dos posiciones son contiguas en el tablero (ortogonalmente)
     */
    sonContiguas(f1, c1, f2, c2) {
        const distanciaFilas = Math.abs(f1 - f2);
        const distanciaColumnas = Math.abs(c1 - c2);
        return (distanciaFilas + distanciaColumnas === 1);
    }

    /**
     * Intercambia dos fichas situadas en distintas celdas
     */
    intercambiarFichas(f1, c1, f2, c2) {
        const aux = this.tablero[f1][c1];
        this.tablero[f1][c1] = this.tablero[f2][c2];
        this.tablero[f2][c2] = aux;
    }

    /**
     * Evalúa si cada una de las filas del tablero contiene fichas del mismo tipo
     * @returns {boolean}
     */
    hayVictoria() {
        return this.tablero.every(fila => {
            const primerTipo = fila[0];
            return fila.every(tipo => tipo === primerTipo);
        });
    }
}
