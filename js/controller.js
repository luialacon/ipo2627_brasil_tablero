/**
 * Controlador de la aplicación Tablero
 * Conecta las acciones del usuario de la Vista con la lógica del Modelo.
 */
export class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.currentMagnitude = 'medium';
        this.currentTheme = 'geometric';

        // Eventos
        this.view.bindControls(this.handleBoardChange.bind(this));
        this.view.bindDragAndDrop(this.handleSwap.bind(this));

        // Iniciar Partida por defecto (3x3)
        this.handleBoardChange(3, 'medium', 'geometric');
    }

    handleBoardChange(size, magnitude, theme) {
        this.currentMagnitude = magnitude;
        this.currentTheme = theme;
        this.view.hideWinOverlay();

        this.model.initBoard(size);
        this.view.renderBoard(this.model.board, this.currentMagnitude, this.currentTheme);
    }

    handleSwap(r1, c1, r2, c2) {
        // Solo permite el intercambio si las celdas son adyacentes
        if (!this.model.isAdjacent(r1, c1, r2, c2)) return;

        this.model.swapPieces(r1, c1, r2, c2);
        this.view.renderBoard(this.model.board, this.currentMagnitude, this.currentTheme);

        if (this.model.checkWin()) {
            setTimeout(() => this.view.showWinOverlay(), 150);
        }
    }
}