let pelota;
let raquetaJugador;
let raquetaComputadora;
let imagenPelota, imagenRaqueta, imagenComputadora, imagenFondo;
let sonidoRaqueta, sonidoEstadio, sonidoGol;
let estadoJuego = 'inicio'; 
let puntosJugador = 0;
let puntosComputadora = 0;
const PUNTOS_MAXIMOS = 10;

class Pelota {
    constructor(x, y, diametro, velocidadX, velocidadY) {
        this.x = x;
        this.y = y;
        this.diametro = diametro;
        this.velocidadX = velocidadX;
        this.velocidadY = velocidadY;
        this.rotacion = 0;
        this.esBrutality = false;
        this.particulas = [];
        this.contadorPOW = 0;
    }

    dibujar() {
        // Dibujar partículas de fuego si está en Brutality
        if (this.esBrutality) {
            this.generarParticulasFuego();
            this.actualizarParticulasFuego();
        }
    
        push();
        translate(this.x, this.y);
        rotate(this.rotacion);
        imageMode(CENTER);
        
        // Color de pelota en Brutality
        if (this.esBrutality) {
            tint(255, 255, 100); // Amarillo casi blanco
        }
        
        image(imagenPelota, 0, 0, this.diametro, this.diametro);
        noTint();
        pop(); 
    }

    update() {
        if (estadoJuego !== 'jugando') return;
    
        this.x += this.velocidadX;
        this.y += this.velocidadY;
    
        // Anti-stuck: prevenir que la pelota se quede en un bucle
        if (abs(this.velocidadX) < 0.1) {
            this.velocidadX = this.velocidadX > 0 ? 5 : -5;
        }
        if (abs(this.velocidadY) < 0.1) {
            this.velocidadY = this.velocidadY > 0 ? 5 : -5;
        }
     
        // Gol
        if (this.x > width - (this.diametro/2 + 1) || this.x < (this.diametro/2 + 1)) {
            this.registrarGol();
        }
    
        // Rebote en bordes verticales
        if (this.y > height - (this.diametro/2) || this.y < (this.diametro/2)) {
            this.y = constrain(this.y, this.diametro/2, height - this.diametro/2);
            this.velocidadY = -this.velocidadY;
        }
    
        this.calcularRotacion();
    }

    registrarGol() {
        console.log("Método registrarGol llamado");
    
        // Condiciones más explícitas para gol
        if (this.x >= width - this.diametro/2) {
            puntosJugador++;
            // Solo incrementar contador POW cuando anota el jugador
            this.contadorPOW++;
            console.log(`Gol para Colombia! Puntos: ${puntosJugador}`);
        } else if (this.x <= this.diametro/2) {
            puntosComputadora++;
            console.log(`Gol para Argentina! Puntos: ${puntosComputadora}`);
        }
    
        this.reset();
        
        if (puntosJugador >= PUNTOS_MAXIMOS || puntosComputadora >= PUNTOS_MAXIMOS) {
            estadoJuego = 'fin';
            if (sonidoEstadio) sonidoEstadio.stop();
        }
        this.desactivarBrutality();
    }

    calcularRotacion() {
        const velocidadMagnitud = Math.sqrt(
            this.velocidadX * this.velocidadX + 
            this.velocidadY * this.velocidadY
        );

        const velocidadRotacion = velocidadMagnitud * 0.1;

        this.rotacion += velocidadRotacion;
        this.rotacion %= TWO_PI;
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        
        // Añadir más aleatoriedad a la dirección inicial
        this.velocidadX = this.velocidadX > 0 ? -random(6, 10) : random(6, 10);
        this.velocidadY = random(-8, 8);
        this.rotacion = 0; 
    
        if (sonidoGol) sonidoGol.play();
    }
    generarParticulasFuego() {
        for (let i = 0; i < 10; i++) {  // Más partículas
            this.particulas.push({
                x: this.x + random(-20, 20),  // Área más amplia
                y: this.y + random(-20, 20),
                tamaño: random(5, 15),  // Partículas más grandes
                opacidad: 255,
                velocidadY: random(-2, 2),
                color: color(random(200, 255), random(50, 100), 0)  // Colores más variados
            });
        }
    }
    
    actualizarParticulasFuego() {
        for (let i = this.particulas.length - 1; i >= 0; i--) {
            let p = this.particulas[i];
            
            fill(p.color, p.opacidad);
            noStroke();
            ellipse(p.x, p.y, p.tamaño);
            
            p.x += random(-1, 1);  // Movimiento más aleatorio
            p.y += p.velocidadY;
            p.tamaño *= 0.95;  // Reducción gradual
            p.opacidad -= 15;
            
            if (p.opacidad <= 0 || p.tamaño < 1) {
                this.particulas.splice(i, 1);
            }
        }
    }
    
    activarBrutality() {
        this.esBrutality = true;
        this.velocidadX *= 1.05;
        this.velocidadY *= 1.05;

        if (sonidoBrutality) {
            sonidoBrutality.play();
            sonidoBrutality.setVolume(0.5); 
        }
    }
    desactivarBrutality() {
        this.esBrutality = false;
    }

}
class Raqueta {
    constructor(x, esPrincipal) {
        this.ancho = 20;
        this.alto = 100;
        this.x = x;
        this.y = height / 2;
        this.velocidad = 4;
        this.esPrincipal = esPrincipal;
        this.imagen = esPrincipal ? imagenRaqueta : imagenComputadora;
    }

    dibujar() {
        imageMode(CENTER);
        image(this.imagen, this.x, this.y, this.ancho * 2, this.alto);
    }

    mover() {
        if (estadoJuego !== 'jugando') return;

        if (this.esPrincipal) {
            this.y = mouseY;
        } else {
            // IA simple para la computadora
            if (this.y < pelota.y) {
                this.y += this.velocidad;
            } else if (this.y > pelota.y) {
                this.y -= this.velocidad;
            }
        }

        this.y = constrain(this.y, this.alto/2, height - this.alto/2);
    }

    colisionConPelota(pelota) {
        if (estadoJuego !== 'jugando') return;
    
        // Ajustar los márgenes de colisión
        const margenX = this.ancho / 2;
        const margenY = this.alto / 2;
    
        const colisionX = pelota.x - pelota.diametro/2 < this.x + margenX &&
                          pelota.x + pelota.diametro/2 > this.x - margenX;
        
        const colisionY = pelota.y - pelota.diametro/2 < this.y + margenY &&
                          pelota.y + pelota.diametro/2 > this.y - margenY;
    
        if (colisionX && colisionY) {
            // Prevenir que la pelota se quede atascada
            if (this.esPrincipal) {
                pelota.x = this.x + margenX + pelota.diametro/2;
            } else {
                pelota.x = this.x - margenX - pelota.diametro/2;
            }
            
            if (sonidoRaqueta) sonidoRaqueta.play();    
    
            pelota.velocidadX = -pelota.velocidadX;
            const MAX_VELOCIDAD = 12;
            pelota.velocidadX = constrain(pelota.velocidadX * 1.1, -MAX_VELOCIDAD, MAX_VELOCIDAD);
            pelota.velocidadY = constrain(pelota.velocidadY * 1.1, -MAX_VELOCIDAD, MAX_VELOCIDAD);
    
            let diferencia = pelota.y - this.y;
            pelota.velocidadY = diferencia * 0.2;
        }
    }
}
function keyPressed() {
    if (key === ' ' && estadoJuego === 'jugando') {
        if (pelota.contadorPOW >= 3) {
            pelota.activarBrutality();
            // Resetear el contador POW después de usar Brutality
            pelota.contadorPOW = 0;
        }
    }
}
function preload() {
    // Usar rutas relativas precisas y añadir callbacks de error
    imagenPelota = loadImage('./img/BalonSinFondo.png', 
        () => console.log('Balón cargado'), 
        (err) => console.error('Error al cargar balón', err)
    );
    imagenRaqueta = loadImage('./img/RaquetaFalcao.png', 
        () => console.log('Raqueta jugador cargada'), 
        (err) => console.error('Error al cargar raqueta jugador', err)
    );
    imagenComputadora = loadImage('./img/RaquetaMessi.png', 
        () => console.log('Raqueta computadora cargada'), 
        (err) => console.error('Error al cargar raqueta computadora', err)
    );
        sonidoBrutality = loadSound('./Sonidos/Fuego_Dragon.mp3', 
            () => console.log('Sonido Brutality cargado'), 
            (err) => console.error('Error al cargar sonido Brutality', err)
        );
    imagenFondo = loadImage('./img/CanchaModificada.png', 
        () => console.log('Fondo cargado'), 
        (err) => console.error('Error al cargar fondo', err)
    );

    sonidoEstadio = loadSound('./Sonidos/SonidoFondoEstadio.mp3', 
        () => console.log('Sonido estadio cargado'), 
        (err) => console.error('Error al cargar sonido de estadio', err)
    );
    sonidoGol = loadSound('./Sonidos/Gol.wav', 
        () => console.log('Sonido de gol cargado'), 
        (err) => console.error('Error al cargar sonido de gol', err)
    );
    sonidoRaqueta = loadSound('./Sonidos/Chutar.wav', 
        () => console.log('Sonido de raqueta cargado'), 
        (err) => console.error('Error al cargar sonido de raqueta', err)
    );
}

function setup() {
    createCanvas(800, 400);
    imagenFondo.resize(width, height);

    pelota = new Pelota(400, 200, 50, 8, 8);
    raquetaJugador = new Raqueta(30, true);
    raquetaComputadora = new Raqueta(width - 30, false);
    
    if (sonidoEstadio) {
        sonidoEstadio.loop();
        sonidoEstadio.setVolume(0.5);
    }
}

function draw() {
    // Verificar carga de recursos
    if (!imagenFondo || !imagenPelota || !imagenRaqueta || !imagenComputadora) {
        textAlign(CENTER, CENTER);
        textSize(24);
        fill(0);
        text('Cargando recursos... Por favor, espere', width / 2, height / 2);
        return;
    }

    // Dibujar fondo
    imageMode(CORNER);
    image(imagenFondo, 0, 0, width, height);

    // Pantalla de inicio
    if (estadoJuego === 'inicio') {
        textAlign(CENTER, CENTER);
        textSize(32);
        fill(255);
        textFont('Arial');
        text('Haz clic para comenzar', width / 2, height / 2);
        textSize(24);
        text('Juega con el mouse', width / 2, height / 2 + 50);
        return;
    }

    // Fin de juego
    if (estadoJuego === 'fin') {
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255);
        
        if (puntosJugador >= PUNTOS_MAXIMOS) {
            text('¡COLOMBIA CAMPEÓN!', width / 2, height / 2);
        } else if (puntosComputadora >= PUNTOS_MAXIMOS) {
            text('¡ARGENTINA CAMPEÓN!', width / 2, height / 2);
        }
        
        textSize(32);
        text(`Marcador Final: ${puntosJugador} - ${puntosComputadora}`, width / 2, height / 2 + 100);
        
        textSize(24);
        text('Haz clic para reiniciar', width / 2, height / 2 + 200);
        return;
    }

    // Lógica del juego
    if (estadoJuego === 'jugando') {
        raquetaJugador.mover();
        raquetaComputadora.mover();
        
        pelota.update();
        
        raquetaJugador.dibujar();
        raquetaComputadora.dibujar();
        pelota.dibujar();

        raquetaJugador.colisionConPelota(pelota);
        raquetaComputadora.colisionConPelota(pelota);

        // Dibujar marcador
        dibujarMarcador();
    }
}

function dibujarMarcador() {
    textAlign(CENTER);
    textSize(32);
    fill(255);
    textFont('Arial Black');
    
    // Marcador del jugador (izquierda)
    text(puntosJugador, width / 4, 50);
    
    // Marcador de la computadora (derecha)
    text(puntosComputadora, width * 3 / 4, 50);
    
    // Línea divisoria
    stroke(255);
    strokeWeight(2);
    line(width / 2, 0, width / 2, 60);

    // Texto POW
    textSize(24);
    fill(255);
    text('POW', width / 2, height - 40);

    // Barra POW con transición de color
    let colorBase = color(0, 100, 255);
    let colorTransicion = color(255, 100, 0);
    let colorActual = lerpColor(colorBase, colorTransicion, sin(frameCount * 0.1));
    
    fill(colorActual);
    rect(width / 2 - 50, height - 30, pelota.contadorPOW * 20, 20);

    if (pelota.contadorPOW >= 3) {
        // Hacer parpadear la barra
        if (frameCount % 20 < 10) {
            stroke(255, 255, 0); // Borde amarillo
            strokeWeight(4);
        }
    if (pelota.esBrutality) {
            textSize(64);
            let brutColor = frameCount % 10 < 5 ? color(255, 0, 0) : color(255, 255, 0);
            fill(brutColor);
            textAlign(CENTER);
            
            // Efecto de zoom y rotación
            push();
            translate(width/2, height/2);
            rotate(sin(frameCount * 0.2) * 0.2);
            scale(1 + sin(frameCount * 0.1) * 0.2);
            text('BRUTALITY', 0, 0);
            pop();
        }
    }

    fill(colorActual);
    rect(width / 2 - 50, height - 30, pelota.contadorPOW * 20, 20);
    
    // Resetear stroke
    noStroke();

    // Texto de instrucción cuando POW está listo
    if (pelota.contadorPOW >= 3) {
        textSize(18);
        fill(255, 255, 0); // Color amarillo
        textAlign(CENTER);
        text('PRESIONA ESPACIO PARA BRUTALITY!', width / 2, height - 10);
    }

   // Dibujar BRUTALITY intermitente cuando está activado
    if (pelota.esBrutality) {
        let brutColor = frameCount % 10 < 5 ? color(255, 0, 0) : color(255, 255, 0);
        textSize(48);
        fill(brutColor);
        text('BRUTALITY', width / 2, height / 2);
    }
}

function mousePressed() {
    switch (estadoJuego) {
        case 'inicio':
            estadoJuego = 'jugando';
            break;
        
        case 'fin':
            // Reiniciar juego
            reiniciarJuego();
            break;
    }
}

function reiniciarJuego() {
    // Resetear puntos
    puntosJugador = 0;
    puntosComputadora = 0;

    // Resetear pelota
    pelota = new Pelota(400, 200, 50, 8, 8);

    // Volver a estado de inicio
    estadoJuego = 'inicio';

    // Reiniciar música
    if (sonidoEstadio) {
        sonidoEstadio.loop();
        sonidoEstadio.setVolume(0.5);
    }
}
// Función para manejar errores de carga de recursos
function handleResourceError(resourceType, path) {
    console.error(`Error cargando ${resourceType}: ${path}`);
    alert(`No se pudo cargar el recurso: ${resourceType}`);
}

// Función de depuración para verificar rutas y recursos
function debugResourceLoading() {
    console.log('Estado de recursos:', {
        imagenPelota: imagenPelota !== undefined,
        imagenRaqueta: imagenRaqueta !== undefined,
        imagenComputadora: imagenComputadora !== undefined,
        imagenFondo: imagenFondo !== undefined,
        sonidoEstadio: sonidoEstadio !== undefined,
        sonidoGol: sonidoGol !== undefined,
        sonidoRaqueta: sonidoRaqueta !== undefined
    });
}

// Añadir efectos visuales adicionales
function dibujarEfectoGol() {
    // Efecto de destello cuando se anota un gol
    if (frameCount % 10 < 5) {
        noStroke();
        fill(255, 100);
        rect(0, 0, width, height);
    }
}

// Método para ajustar dificultad
function ajustarDificultad() {
    // Aumentar dificultad según avanza el juego
    let factorDificultad = 1 + (puntosJugador + puntosComputadora) * 0.1;
    
    // Modificar velocidad de la computadora
    raquetaComputadora.velocidad = 5 * factorDificultad;
    
    // Incrementar velocidad de la pelota gradualmente
    pelota.velocidadX *= 1.01;
    pelota.velocidadY *= 1.01;
}

// Función para mostrar estadísticas al final
function mostrarEstadisticas() {
    let estadisticas = `
    Estadísticas del Juego:
    Goles de Colombia: ${puntosJugador}
    Goles de Argentina: ${puntosComputadora}
    Diferencia de goles: ${Math.abs(puntosJugador - puntosComputadora)}
    `;
    
    console.log(estadisticas);
    
    // Opcional: Guardar en localStorage
    localStorage.setItem('ultimoPartido', estadisticas);
}

// Modificar el draw para incluir más efectos
function draw() {
    // Verificaciones previas (como en el código anterior)
    
    // Dibujar fondo
    imageMode(CORNER);
    image(imagenFondo, 0, 0, width, height);

    // Estados del juego con efectos
    switch(estadoJuego) {
        case 'inicio':
            dibujarPantallaInicio();
            break;
        
        case 'jugando':
            actualizarJuego();
            break;
        
        case 'fin':
            mostrarPantallaFinal();
            break;
    }
}

function dibujarPantallaInicio() {
    // Efecto de parpadeo en texto
    let brillo = sin(frameCount * 0.1) * 127 + 128;
    
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255, brillo);
    textFont('Arial');
    text('Haz clic para comenzar', width/2, height/2);
    
    textSize(24);
    text('Juega con el mouse', width/2, height/2 + 50);
}

function actualizarJuego() {
    // Movimientos y colisiones
    raquetaJugador.mover();
    raquetaComputadora.mover();
    
    pelota.update();
    
    // Dibujar elementos
    raquetaJugador.dibujar();
    raquetaComputadora.dibujar();
    pelota.dibujar();

    // Colisiones
    raquetaJugador.colisionConPelota(pelota);
    raquetaComputadora.colisionConPelota(pelota);

    // Dibujar marcador
    dibujarMarcador();
    
    // Ajustar dificultad
    ajustarDificultad();
}

function mostrarPantallaFinal() {
    // Fondo semi-transparente
    fill(0, 150);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255);
    
    // Mensaje de campeón con efecto de parpadeo
    let brillo = sin(frameCount * 0.2) * 127 + 128;
    
    if (puntosJugador >= PUNTOS_MAXIMOS) {
        fill(0, 100, 255, brillo);
        text('¡COLOMBIA CAMPEÓN!', width/2, height/2);
    } else if (puntosComputadora >= PUNTOS_MAXIMOS) {
        fill(255, 100, 0, brillo);
        text('¡ARGENTINA CAMPEÓN!', width/2, height/2);
    }
    
    // Estadísticas
    textSize(32);
    fill(255);
    text(`Marcador Final: ${puntosJugador} - ${puntosComputadora}`, width/2, height/2 + 100);
    
    textSize(24);
    text('Haz clic para reiniciar', width/2, height/2 + 200);

    // Mostrar estadísticas
    mostrarEstadisticas();
}

// Manejo global de errores
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    alert('Ocurrió un error inesperado. Recarga la página.');
});