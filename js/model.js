/**
 * Modelo de datos de la aplicación Tablero
 * Mantiene el estado del tablero NxN y evalúa las condiciones de victoria.
 */
export class Model {
    constructor() {
        this.size = 3;
        this.board = [];
    }

    /**
     * Inicializa un nuevo tablero NxN.
     * Genera una combinación resoluble asignando filas completas de tipos de fichas.
    /**
     * Inicializa un nuevo tablero NxN (limitado entre 3 y 10).
     * @param {number} size 
     */
    initBoard(size) {
        this.size = Math.min(10, Math.max(3, size));
        this.board = [];

        const flatPieces = [];
        const rowTypes = [1, 2, 3];

        for (let r = 3; r < this.size; r++) {
            rowTypes.push(Math.floor(Math.random() * 3) + 1);
        }

        rowTypes.forEach(type => {
            for (let c = 0; c < this.size; c++) {
                flatPieces.push(type);
            }
        });

        for (let i = flatPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flatPieces[i], flatPieces[j]] = [flatPieces[j], flatPieces[i]];
        }

        for (let r = 0; r < this.size; r++) {
            const row = flatPieces.slice(r * this.size, (r + 1) * this.size);
            this.board.push(row);
        }
    }

    /**
     * Verifica si dos posiciones son contiguas en el tablero (ortogonalmente)
     */
    isAdjacent(r1, c1, r2, c2) {
        const rowDiff = Math.abs(r1 - r2);
        const colDiff = Math.abs(c1 - c2);
        return (rowDiff + colDiff === 1);
    }

    /**
     * Intercambia dos fichas situadas en distintas celdas
     */
    swapPieces(r1, c1, r2, c2) {
        const temp = this.board[r1][c1];
        this.board[r1][c1] = this.board[r2][c2];
        this.board[r2][c2] = temp;
    }

    /**
     * Evalúa si cada una de las filas del tablero contiene fichas del mismo tipo
     * @returns {boolean}
     */
    checkWin() {
        return this.board.every(row => {
            const firstType = row[0];
            return row.every(pieceType => pieceType === firstType);
        });
    }
}