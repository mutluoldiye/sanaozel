/**
 * ============================================================================
 * 1. WEB AUDIO API "MÜZİK KUTUSU" SENTEZLEYİCİ (Sıfır Harici MP3 Bağımlılığı)
 * ============================================================================
 */
class MusicBoxSynth {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.loopTimer = null;
        this.step = 0;

        // F Major Pentatonik (Sıcak, huzurlu, müzik kutusu frekansları - Hz)
        this.melodyNotes = [
            523.25, // C5
            659.25, // E5
            587.33, // D5
            440.00, // A4
            523.25, // C5
            783.99, // G5
            659.25, // E5
            587.33  // D5
        ];
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playPluck(freq, duration = 2.4, volume = 0.065) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, now);

        const overtoneGain = this.ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.012, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + duration);
        overtone.stop(now + duration);
    }

    playSparkleChime() {
        if (!this.ctx) this.initContext();
        if (!this.ctx) return;

        const chimeNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        chimeNotes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playPluck(freq, 1.8, 0.05);
            }, idx * 95);
        });
    }

    toggle() {
        this.initContext();
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            this.start();
            return true;
        }
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const tick = () => {
            if (!this.isPlaying) return;
            const note = this.melodyNotes[this.step % this.melodyNotes.length];
            this.playPluck(note, 2.6, 0.055);

            if (this.step % 4 === 0) {
                this.playPluck(note * 0.5, 3.2, 0.035);
            }

            this.step++;
            this.loopTimer = setTimeout(tick, 950);
        };

        tick();
    }

    stop() {
        this.isPlaying = false;
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
    }
}

/**
 * ============================================================================
 * 2. AMBIENT SAKURA / IŞIK PARTİKÜL MOTORU
 * ============================================================================
 */
const initAmbientCanvas = () => {
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d', { alpha: true });

    let width = 0;
    let height = 0;
    let particles = [];
    let burstParticles = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    const particleCount = width < 600 ? 25 : 40;

    class SoftPetal {
        constructor(isInitial = false) {
            this.reset(isInitial);
        }

        reset(isInitial = false) {
            this.x = Math.random() * width;
            this.y = isInitial ? Math.random() * height : -20;
            this.size = Math.random() * 5 + 3.5;
            this.speedY = Math.random() * 0.45 + 0.25;
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.swingAngle = Math.random() * Math.PI * 2;
            this.swingSpeed = Math.random() * 0.015 + 0.008;
            this.opacity = Math.random() * 0.45 + 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.012;
            const colors = [
                'rgba(244, 172, 204, ',
                'rgba(255, 205, 226, ',
                'rgba(232, 141, 180, ',
                'rgba(255, 255, 255, '
            ];
            this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.swingAngle += this.swingSpeed;
            this.x += this.speedX + Math.sin(this.swingAngle) * 0.3;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            if (this.y > height + 20) this.reset(false);
            if (this.x > width + 20) this.x = -20;
            if (this.x < -20) this.x = width + 20;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = `${this.colorPrefix}${this.opacity})`;
            ctx.fill();
            ctx.restore();
        }
    }

    class WishSpark {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 2.4 + 0.8;
            this.vx = Math.cos(angle) * velocity;
            this.vy = Math.sin(angle) * velocity - 1.5;
            this.size = Math.random() * 4 + 2;
            this.alpha = 1;
            this.decay = Math.random() * 0.012 + 0.008;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy -= 0.022;
            this.alpha -= this.decay;
        }

        draw() {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232, 141, 180, ${this.alpha})`;
            ctx.shadowColor = 'rgba(232, 141, 180, 0.8)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new SoftPetal(true));
    }

    const animate = () => {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        for (let i = burstParticles.length - 1; i >= 0; i--) {
            burstParticles[i].update();
            burstParticles[i].draw();
            if (burstParticles[i].alpha <= 0) {
                burstParticles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    };

    animate();

    return (originX, originY) => {
        for (let i = 0; i < 24; i++) {
            burstParticles.push(new WishSpark(originX, originY));
        }
    };
};

/**
 * ============================================================================
 * 3. BUĞULU CAM SİLME MOTORU
 * ============================================================================
 */
const initFogCanvas = (onClearedCallback) => {
    const canvas = document.getElementById('fog-canvas');
    const container = document.getElementById('fog-container');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let isCleared = false;
    let strokeCount = 0;

    const setupFogLayer = () => {
        if (isCleared) return;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, 'rgba(253, 238, 245, 0.96)');
        grad.addColorStop(0.5, 'rgba(248, 218, 234, 0.95)');
        grad.addColorStop(1, 'rgba(252, 232, 242, 0.96)');

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#b55982';
        ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨ Parmağınla buğuyu sil ✨', canvas.width / 2, canvas.height / 2);
    };

    setupFogLayer();
    window.addEventListener('resize', setupFogLayer, { passive: true });

    const scratch = (clientX, clientY) => {
        if (isCleared) return;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        strokeCount++;
        if (strokeCount % 12 === 0) {
            checkClearPercentage();
        }
    };

    const checkClearPercentage = () => {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparentPixels = 0;
        const totalPixels = imgData.length / 4;

        for (let i = 3; i < imgData.length; i += 64) {
            if (imgData[i] < 128) {
                transparentPixels++;
            }
        }

        const sampledTotal = totalPixels / 16;
        const clearRatio = transparentPixels / sampledTotal;

        if (clearRatio > 0.46 && !isCleared) {
            isCleared = true;
            canvas.classList.add('cleared');
            if (typeof onClearedCallback === 'function') {
                onClearedCallback();
            }
        }
    };

    canvas.addEventListener('pointerdown', (e) => {
        isDrawing = true;
        scratch(e.clientX, e.clientY);
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!isDrawing) return;
        scratch(e.clientX, e.clientY);
    });

    window.addEventListener('pointerup', () => {
        isDrawing = false;
    });
};

/**
 * ============================================================================
 * 4. ANA UYGULAMA, ŞİFRE EKRANI & GSAP ETKİLEŞİMLERİ
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', force3D: true });

    const synth = new MusicBoxSynth();
    const triggerWishSparks = initAmbientCanvas();

    // SAYFAYI ŞİFRE GİRİLENE KADAR KİLİTLE VE EN ÜSTE AL
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    // --- ŞİFRE KONTROL MANTIĞI ---
    const passScreen = document.getElementById('password-screen');
    const passInput = document.getElementById('secret-word');
    const passBtn = document.getElementById('unlock-btn');
    const passError = document.getElementById('password-error');

    const handleUnlock = () => {
        const val = passInput.value.trim().toLocaleLowerCase('tr-TR');

        if (val === 'kavaklıdere') {
            passError.classList.remove('visible');
            passInput.blur(); // Klavyeyi kapat
            synth.playSparkleChime();

            gsap.to(passScreen, {
                opacity: 0,
                backdropFilter: 'blur(0px)',
                duration: 0.9,
                ease: 'power2.inOut',
                onComplete: () => {
                    passScreen.style.display = 'none';
                    document.body.style.overflow = ''; // Scroll'u aç
                    startMainStory();
                }
            });
        } else {
            passError.classList.add('visible');
            gsap.fromTo(passInput,
                { x: -8 },
                { x: 8, duration: 0.08, yoyo: true, repeat: 5, ease: 'linear', clearProps: 'x' }
            );
        }
    };

    passBtn.addEventListener('click', handleUnlock);
    passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUnlock();
    });

    // --- ANA HİKAYE ANİMASYONLARI (Şifreden sonra tetiklenir) ---
    function startMainStory() {

        // Ses Butonu Kontrolleri
        const audioBtn = document.getElementById('audio-toggle');
        const audioLabel = document.getElementById('audio-label-text');

        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                const playing = synth.toggle();
                audioBtn.classList.toggle('playing', playing);
                audioBtn.setAttribute('aria-pressed', playing);
                audioLabel.textContent = playing ? 'Melodi Açık' : 'Melodiyi Aç';
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && synth.isPlaying) {
                synth.stop();
                if (audioBtn) {
                    audioBtn.classList.remove('playing');
                    audioLabel.textContent = 'Melodiyi Aç';
                }
            }
        });

        // İpek İplik (SVG Path)
        const silkPath = document.getElementById('silk-path');
        if (silkPath) {
            const pathLength = silkPath.getTotalLength();
            gsap.set(silkPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

            gsap.to(silkPath, {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
            });

            gsap.to('.thread-bloom', {
                opacity: 0.75, scale: 1.3, stagger: 0.25,
                scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
            });
        }

        // Hero Girişi
        const heroTl = gsap.timeline({ delay: 0.1 });
        heroTl.fromTo('.hero-anim', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, stagger: 0.25 })
            .to('#scroll-hint', { opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=0.4');

        ScrollTrigger.create({
            trigger: '#sec-intent', start: 'top 85%',
            onEnter: () => gsap.to('#scroll-hint', { opacity: 0, duration: 0.35 }),
            onLeaveBack: () => gsap.to('#scroll-hint', { opacity: 1, duration: 0.35 })
        });

        // Niyet Kartı
        gsap.fromTo('.reveal-card',
            { y: 45, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 1.15, scrollTrigger: { trigger: '#sec-intent', start: 'top 74%', toggleActions: 'play none none reverse' } }
        );

        // İnce Detaylar
        gsap.fromTo('.reveal-details-head',
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.95, stagger: 0.15, scrollTrigger: { trigger: '#sec-details', start: 'top 76%', toggleActions: 'play none none reverse' } }
        );

        const carousel = document.getElementById('details-carousel');
        const dots = document.querySelectorAll('#carousel-dots .dot');
        if (carousel && dots.length > 0) {
            carousel.addEventListener('scroll', () => {
                const scrollLeft = carousel.scrollLeft;
                const cardWidth = carousel.querySelector('.swipe-card').offsetWidth + 16;
                const activeIndex = Math.min(Math.round(scrollLeft / cardWidth), dots.length - 1);
                dots.forEach((dot, idx) => dot.classList.toggle('active', idx === activeIndex));
            }, { passive: true });
        }

        // Değerler
        gsap.fromTo('.reveal-text',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.15, scrollTrigger: { trigger: '#sec-value', start: 'top 75%', toggleActions: 'play none none reverse' } }
        );

        gsap.fromTo('.stagger-item',
            { y: 36, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.05, stagger: 0.22, scrollTrigger: { trigger: '.stagger-list', start: 'top 78%', toggleActions: 'play none none reverse' } }
        );

        // Buğulu Cam Section Init
        gsap.fromTo('.reveal-fog',
            { y: 32, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.05, stagger: 0.16, scrollTrigger: { trigger: '#sec-fog', start: 'top 75%', toggleActions: 'play none none reverse' } }
        );

        initFogCanvas(() => {
            synth.playSparkleChime();
            const container = document.getElementById('fog-container');
            if (container) {
                const rect = container.getBoundingClientRect();
                triggerWishSparks(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        });

        // Zaman Kapsülü ve Veda
        gsap.fromTo(['.reveal-capsule', '.reveal-farewell'],
            { y: 38, opacity: 0, scale: 0.97 },
            { y: 0, opacity: 1, scale: 1, duration: 1.15, stagger: 0.25, scrollTrigger: { trigger: '#sec-farewell', start: 'top 74%', toggleActions: 'play none none reverse' } }
        );

        const envBtn = document.getElementById('envelope-trigger');
        const capsuleLetter = document.getElementById('capsule-letter');
        const envStatus = document.getElementById('envelope-status');

        if (envBtn && capsuleLetter) {
            envBtn.addEventListener('click', () => {
                const isExpanded = envBtn.getAttribute('aria-expanded') === 'true';
                const nextState = !isExpanded;

                envBtn.setAttribute('aria-expanded', nextState);
                capsuleLetter.setAttribute('aria-hidden', !nextState);

                if (nextState) {
                    synth.playSparkleChime();
                    envStatus.textContent = 'Mektup açıldı ✨';
                    gsap.to(capsuleLetter, { height: 'auto', opacity: 1, duration: 0.65, ease: 'power2.out', onComplete: () => ScrollTrigger.refresh() });
                } else {
                    envStatus.textContent = 'Bir gün moralin çok bozulursa açmak için dokun';
                    gsap.to(capsuleLetter, { height: 0, opacity: 0, duration: 0.45, ease: 'power2.inOut', onComplete: () => ScrollTrigger.refresh() });
                }
            });
        }

        // Dilek Butonu
        const wishBtn = document.getElementById('wish-trigger');
        const orbHint = document.getElementById('orb-hint-text');

        if (wishBtn) {
            wishBtn.addEventListener('click', () => {
                const rect = wishBtn.getBoundingClientRect();
                triggerWishSparks(rect.left + rect.width / 2, rect.top + rect.height / 2);
                synth.playSparkleChime();

                gsap.fromTo(wishBtn, { scale: 0.86 }, { scale: 1, duration: 0.65, ease: 'elastic.out(1.2, 0.4)' });
                if (orbHint) orbHint.textContent = 'Gökyüzüne bir dilek bırakıldı ✨';
            });
        }
    }
});