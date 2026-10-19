/**
 * Vista de la aplicación Tablero
 * Pinta la interfaz mediante atributos data-* e implementa HTML5 Drag & Drop.
 */
export class Vista {
    constructor() {
        // Selección de elementos mediante atributos data-*
        this.tablero = document.querySelector('[data-tablero]');
        this.campoDimension = document.querySelector('[data-ajuste="dimension"]');
        this.radiosTamano = document.querySelectorAll('[data-ajuste="tamano"]');
        this.selectorFormas = document.querySelector('[data-ajuste="formas"]');
        this.selectorColores = document.querySelector('[data-ajuste="colores"]');
        this.botonReiniciar = document.querySelector('[data-accion="reiniciar"]');

        this.botonReglas = document.querySelector('[data-accion="abrir-reglas"]');
        this.modalReglas = document.querySelector('[data-modal="reglas"]');
        this.botonesCerrarReglas = document.querySelectorAll('[data-accion="cerrar-reglas"]');

        this.capaVictoria = document.querySelector('[data-victoria]');
        this.botonVolverAJugar = document.querySelector('[data-accion="volver-a-jugar"]');

        this.aviso = document.querySelector('[data-aviso]');
        this.temporizadorAviso = null;

        // Canvas oculto montado en el DOM para permitir la captura del Drag Image en cualquier navegador
        this.lienzoArrastre = document.createElement('canvas');
        this.lienzoArrastre.classList.add('lienzo-arrastre');
        document.body.appendChild(this.lienzoArrastre);

        this.prepararModal();
    }

    prepararModal() {
        this.botonReglas.addEventListener('click', () => this.modalReglas.showModal());
        this.botonesCerrarReglas.forEach(boton => boton.addEventListener('click', () => this.modalReglas.close()));
    }

    pintarTablero(tablero, tamano, formas, colores) {
        const n = tablero.length;
        this.tablero.dataset.formas = formas;
        this.tablero.dataset.colores = colores;
        this.tablero.style.setProperty('--n', n); // la rejilla N×N se define en espacial.css
        this.tablero.innerHTML = '';

        for (let f = 0; f < n; f++) {
            for (let c = 0; c < n; c++) {
                const celda = document.createElement('div');
                celda.classList.add('celda');
                celda.dataset.celda = '';
                celda.dataset.fila = f;
                celda.dataset.columna = c;

                const ficha = document.createElement('div');
                ficha.classList.add('ficha');
                ficha.dataset.ficha = '';
                ficha.dataset.tipo = tablero[f][c];
                ficha.dataset.tamano = tamano;
                ficha.draggable = true;

                celda.appendChild(ficha);
                this.tablero.appendChild(celda);
            }
        }
    }

    /**
     * Dibuja la figura exacta según las formas elegidas (Círculo, Cuadrado, Triángulo / Píldora, Rombo, Hoja) con resplandor en el Canvas acoplado al DOM
     */
    dibujarImagenArrastre(ficha) {
        const tipo = ficha.dataset.tipo;
        const lado = ficha.offsetWidth || 50;
        const holgura = 12; // Espacio extra para proyectar la sombra neón sin recortarla
        const ladoTotal = lado + holgura * 2;

        this.lienzoArrastre.width = ladoTotal;
        this.lienzoArrastre.height = ladoTotal;
        const ctx = this.lienzoArrastre.getContext('2d');
        ctx.clearRect(0, 0, ladoTotal, ladoTotal);

        // El color se lee de la forma ya pintada (cromatico.css es la única fuente de verdad)
        const colorRelleno = getComputedStyle(ficha, '::before').backgroundColor; // "rgb(r, g, b)"
        const colorResplandor = colorRelleno.replace('rgb(', 'rgba(').replace(')', ', 0.8)');

        ctx.fillStyle = colorRelleno;
        ctx.shadowColor = colorResplandor;
        ctx.shadowBlur = 10;

        const formas = this.tablero.dataset.formas || 'geometrico';

        if (formas === 'suave') {
            if (tipo === '1') {
                // Píldora horizontal
                this.dibujarRectanguloRedondeado(ctx, holgura, holgura + lado * 0.22, lado, lado * 0.56, lado * 0.28);
            } else if (tipo === '2') {
                // Rombo de esquinas redondeadas
                const ladoRombo = lado * 0.7;
                ctx.save();
                ctx.translate(ladoTotal / 2, ladoTotal / 2);
                ctx.rotate(Math.PI / 4);
                this.dibujarRectanguloRedondeado(ctx, -ladoRombo / 2, -ladoRombo / 2, ladoRombo, ladoRombo, 8);
                ctx.restore();
            } else if (tipo === '3') {
                // Hoja
                this.dibujarRectanguloRedondeado(ctx, holgura, holgura, lado, lado, [lado / 2, 0, lado / 2, 0]);
            }
        } else {
            if (tipo === '1') {
                ctx.beginPath();
                ctx.arc(ladoTotal / 2, ladoTotal / 2, lado / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (tipo === '2') {
                this.dibujarRectanguloRedondeado(ctx, holgura, holgura, lado, lado, 8);
            } else if (tipo === '3') {
                ctx.beginPath();
                ctx.moveTo(ladoTotal / 2, holgura);
                ctx.lineTo(ladoTotal - holgura, ladoTotal - holgura);
                ctx.lineTo(holgura, ladoTotal - holgura);
                ctx.closePath();
                ctx.fill();
            }
        }

        return { lienzo: this.lienzoArrastre, centro: ladoTotal / 2 };
    }

    dibujarRectanguloRedondeado(ctx, x, y, ancho, alto, radio) {
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, ancho, alto, radio);
        } else {
            ctx.rect(x, y, ancho, alto);
        }
        ctx.fill();
    }

    vincularArrastre(alIntercambiar) {
        let fichaArrastrada = null;

        this.tablero.addEventListener('dragstart', (e) => {
            const ficha = e.target.closest('[data-ficha]');
            if (!ficha) return;

            fichaArrastrada = ficha;
            ficha.classList.add('arrastrando');

            // Dibujar la figura en el canvas oculto y establecerla como imagen de arrastre
            const { lienzo, centro } = this.dibujarImagenArrastre(ficha);
            e.dataTransfer.setDragImage(lienzo, centro, centro);

            const celdaOrigen = ficha.parentElement;
            const origen = {
                fila: celdaOrigen.dataset.fila,
                columna: celdaOrigen.dataset.columna
            };

            e.dataTransfer.setData('text/plain', JSON.stringify(origen));
            e.dataTransfer.effectAllowed = 'move';
        });

        this.tablero.addEventListener('dragend', () => {
            if (fichaArrastrada) {
                fichaArrastrada.classList.remove('arrastrando');
                fichaArrastrada = null;
            }
        });

        this.tablero.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.tablero.addEventListener('dragenter', (e) => {
            const celda = e.target.closest('[data-celda]');
            if (celda) celda.classList.add('destino');
        });

        this.tablero.addEventListener('dragleave', (e) => {
            const celda = e.target.closest('[data-celda]');
            if (celda) celda.classList.remove('destino');
        });

        this.tablero.addEventListener('drop', (e) => {
            e.preventDefault();
            const celdaDestino = e.target.closest('[data-celda]');
            if (!celdaDestino) return;

            celdaDestino.classList.remove('destino');

            const origenTexto = e.dataTransfer.getData('text/plain');
            if (!origenTexto) return;

            const origen = JSON.parse(origenTexto);
            const destino = {
                fila: parseInt(celdaDestino.dataset.fila),
                columna: parseInt(celdaDestino.dataset.columna)
            };

            alIntercambiar(parseInt(origen.fila), parseInt(origen.columna), destino.fila, destino.columna);
        });
    }

    vincularAjustes(alCambiar) {
        const leerAjustes = () => {
            const dimension = parseInt(this.campoDimension.value) || 3; // campo vacío o no numérico → 3
            const tamano = document.querySelector('[data-ajuste="tamano"]:checked').value;
            const formas = this.selectorFormas.value;
            const colores = this.selectorColores.value;
            alCambiar(dimension, tamano, formas, colores);
        };

        this.botonReiniciar.addEventListener('click', leerAjustes);
        this.botonVolverAJugar.addEventListener('click', () => {
            this.ocultarVictoria();
            leerAjustes();
        });

        this.campoDimension.addEventListener('change', leerAjustes);
        this.radiosTamano.forEach(radio => radio.addEventListener('change', leerAjustes));
        this.selectorFormas.addEventListener('change', leerAjustes);
        this.selectorColores.addEventListener('change', leerAjustes);
    }

    mostrarVictoria() {
        this.capaVictoria.classList.remove('oculto');
    }

    ocultarVictoria() {
        this.capaVictoria.classList.add('oculto');
    }

    /**
     * Muestra un aviso flotante sobre el tablero durante unos segundos
     */
    mostrarAviso(mensaje) {
        this.aviso.textContent = mensaje;
        this.aviso.classList.remove('oculto');

        clearTimeout(this.temporizadorAviso);
        this.temporizadorAviso = setTimeout(() => this.aviso.classList.add('oculto'), 2500);
    }

    /**
     * Sincroniza el campo N con la dimensión real del tablero (tras limitarla entre 3 y 10)
     */
    actualizarCampoDimension(dimension) {
        this.campoDimension.value = dimension;
    }
}
