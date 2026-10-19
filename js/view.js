/**
 * Vista de la aplicación Tablero
 * Renderiza la interfaz mediante atributos data-* e implementa HTML5 Drag & Drop.
 */
export class View {
    constructor() {
        this.boardElement = document.getElementById('board');
        this.sizeInput = document.getElementById('input-size');
        this.magnitudeSelect = document.getElementById('select-magnitude');
        this.themeSelect = document.getElementById('select-theme');
        this.restartBtn = document.getElementById('btn-restart');
        
        this.infoBtn = document.getElementById('btn-info');
        this.infoModal = document.getElementById('info-modal');
        this.closeModalBtn = document.getElementById('btn-close-info');
        this.closeModalXBtn = document.getElementById('btn-close-modal-x');
        
        this.statusOverlay = document.getElementById('game-status');
        this.statusRestartBtn = document.getElementById('btn-status-restart');

        // Canvas oculto montado en el DOM para permitir la captura del Drag Image en cualquier navegador
        this.dragCanvas = document.createElement('canvas');
        this.dragCanvas.style.position = 'absolute';
        this.dragCanvas.style.top = '-9999px';
        this.dragCanvas.style.left = '-9999px';
        this.dragCanvas.style.pointerEvents = 'none';
        document.body.appendChild(this.dragCanvas);

        this.initModalEvents();
    }

    initModalEvents() {
        this.infoBtn.addEventListener('click', () => this.infoModal.showModal());
        this.closeModalBtn.addEventListener('click', () => this.infoModal.close());
        this.closeModalXBtn.addEventListener('click', () => this.infoModal.close());
    }

    renderBoard(boardData, magnitude, theme) {
        const n = boardData.length;
        this.boardElement.dataset.theme = theme;
        this.boardElement.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${n}, 1fr)`;
        this.boardElement.innerHTML = '';

        const cellSizes = { small: 50, medium: 70, large: 90 };
        const cellSize = cellSizes[magnitude] || 70;

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.dataset.row = r;
                cell.dataset.col = c;

                const pieceType = boardData[r][c];
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.dataset.type = pieceType;
                piece.dataset.magnitude = magnitude;
                piece.draggable = true;

                cell.appendChild(piece);
                this.boardElement.appendChild(cell);
            }
        }
    }

    /**
     * Dibuja la figura exacta (Círculo, Cuadrado o Triángulo) con resplandor en el Canvas acoplado al DOM
     */
    updateDragCanvas(piece) {
        const type = piece.dataset.type;
        const size = piece.offsetWidth || 50;
        const padding = 12; // Espacio extra para proyectar la sombra neón sin recortarla
        const totalSize = size + padding * 2;

        this.dragCanvas.width = totalSize;
        this.dragCanvas.height = totalSize;
        const ctx = this.dragCanvas.getContext('2d');
        ctx.clearRect(0, 0, totalSize, totalSize);

        const colors = {
            '1': '#ff3b6b',
            '2': '#00e699',
            '3': '#a855f7'
        };

        const glows = {
            '1': 'rgba(255, 59, 107, 0.8)',
            '2': 'rgba(0, 230, 153, 0.8)',
            '3': 'rgba(168, 85, 247, 0.8)'
        };

        const fillColor = colors[type] || '#ffffff';
        const glowColor = glows[type] || 'transparent';

        ctx.fillStyle = fillColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;

        const theme = this.boardElement.dataset.theme || 'geometric';

        if (theme === 'rounded') {
            this.drawRoundedRect(ctx, padding, padding, size, size, 12);
        } else {
            if (type === '1') {
                ctx.beginPath();
                ctx.arc(totalSize / 2, totalSize / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === '2') {
                this.drawRoundedRect(ctx, padding, padding, size, size, 8);
            } else if (type === '3') {
                ctx.beginPath();
                ctx.moveTo(totalSize / 2, padding);
                ctx.lineTo(totalSize - padding, totalSize - padding);
                ctx.lineTo(padding, totalSize - padding);
                ctx.closePath();
                ctx.fill();
            }
        }

        return { canvas: this.dragCanvas, center: totalSize / 2 };
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, radius);
        } else {
            ctx.rect(x, y, width, height);
        }
        ctx.fill();
    }

    bindDragAndDrop(swapHandler) {
        let draggedPiece = null;

        this.boardElement.addEventListener('dragstart', (e) => {
            const piece = e.target.closest('.piece');
            if (!piece) return;

            draggedPiece = piece;
            piece.classList.add('dragging');

            // Renderizar la figura en el canvas oculto y establecer como imagen de arrastre
            const { canvas, center } = this.updateDragCanvas(piece);
            e.dataTransfer.setDragImage(canvas, center, center);

            const sourceCell = piece.parentElement;
            const sourceData = {
                row: sourceCell.dataset.row,
                col: sourceCell.dataset.col
            };

            e.dataTransfer.setData('text/plain', JSON.stringify(sourceData));
            e.dataTransfer.effectAllowed = 'move';
        });

        this.boardElement.addEventListener('dragend', () => {
            if (draggedPiece) {
                draggedPiece.classList.remove('dragging');
                draggedPiece = null;
            }
        });

        this.boardElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.boardElement.addEventListener('dragenter', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) cell.classList.add('drag-over');
        });

        this.boardElement.addEventListener('dragleave', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) cell.classList.remove('drag-over');
        });

        this.boardElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetCell = e.target.closest('.cell');
            if (!targetCell) return;

            targetCell.classList.remove('drag-over');

            const sourceDataRaw = e.dataTransfer.getData('text/plain');
            if (!sourceDataRaw) return;

            const source = JSON.parse(sourceDataRaw);
            const target = {
                row: parseInt(targetCell.dataset.row),
                col: parseInt(targetCell.dataset.col)
            };

            swapHandler(parseInt(source.row), parseInt(source.col), target.row, target.col);
        });
    }

    bindControls(changeHandler) {
        const triggerChange = () => {
            const size = parseInt(this.sizeInput.value);
            const magnitude = this.magnitudeSelect.value;
            const theme = this.themeSelect.value;
            changeHandler(size, magnitude, theme);
        };

        this.restartBtn.addEventListener('click', triggerChange);
        this.statusRestartBtn.addEventListener('click', () => {
            this.hideWinOverlay();
            triggerChange();
        });
        
        this.sizeInput.addEventListener('change', triggerChange);
        this.magnitudeSelect.addEventListener('change', triggerChange);
        this.themeSelect.addEventListener('change', triggerChange);
    }

    showWinOverlay() {
        this.statusOverlay.classList.remove('hidden');
    }

    hideWinOverlay() {
        this.statusOverlay.classList.add('hidden');
    }
}