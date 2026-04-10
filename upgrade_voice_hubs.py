import os

VOICES = ["soprano", "mezzosoprano", "contralto", "tenor", "baritono", "bajo"]
BASE_DIR = r"E:\Harmiq_viaje\cloudflare\tipo-de-voz"

GADGETS_HTML = '''
    <!-- SECCIÓN BIO-HACKING VOCAL (GADGETS AMAZON) -->
    <section style="margin:6rem 0; padding:4rem; background:rgba(124,77,255,0.03); border-radius:48px; border:1px solid rgba(124,77,255,0.1);">
        <h2 style="font-size:2.5rem; font-weight:900; margin-bottom:1rem;">Vocal <span class="grad">Bio-Hacking</span> Kit</h2>
        <p style="color:var(--m); margin-bottom:3rem; max-width:650px;">Acelera tu progreso vocal con las herramientas que usan los profesionales en sus giras mundiales:</p>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
            <div style="background:var(--dark); padding:2rem; border-radius:32px; border:1px solid var(--glass-border); border-bottom:4px solid var(--p);">
                <span style="font-size:2.5rem;">🥤</span>
                <h4 style="font-size:1.4rem; margin-top:1rem;">Lax Vox (Terapia de Pajita)</h4>
                <p style="color:var(--m); font-size:0.9rem; margin:1rem 0;">Relaja y alinea tus cuerdas vocales bajo el agua. Vital para recuperación rápida.</p>
                <a href="https://www.amazon.es/s?k=Lax+Vox+pajita+silicona+entrenamiento+vocal" target="_blank" style="color:var(--p); font-weight:900; text-decoration:none;">VER EN AMAZON →</a>
            </div>
            <div style="background:var(--dark); padding:2rem; border-radius:32px; border:1px solid var(--glass-border); border-bottom:4px solid var(--a);">
                <span style="font-size:2.5rem;">🎭</span>
                <h4 style="font-size:1.4rem; margin-top:1rem;">Beltbox (Máscara Vocal)</h4>
                <p style="color:var(--m); font-size:0.9rem; margin:1rem 0;">Calienta tu voz en cualquier lugar sin molestar a nadie. Silencia tu volumen un 90%.</p>
                <a href="https://www.amazon.es/s?k=Beltbox+vocal+dampener+mask" target="_blank" style="color:var(--a); font-weight:900; text-decoration:none;">VER EN AMAZON →</a>
            </div>
            <div style="background:var(--dark); padding:2rem; border-radius:32px; border:1px solid var(--glass-border); border-bottom:4px solid #fff;">
                <span style="font-size:2.5rem;">💨</span>
                <h4 style="font-size:1.4rem; margin-top:1rem;">Nebulizador Vocal</h4>
                <p style="color:var(--m); font-size:0.9rem; margin:1rem 0;">Hidratación celular directa en las cuerdas vocales con micro-vaporización.</p>
                <a href="https://www.amazon.es/s?k=Vocal+Mist+Nebulizador+portatil" target="_blank" style="color:#fff; font-weight:900; text-decoration:none;">VER EN AMAZON →</a>
            </div>
        </div>
    </section>

    <!-- SECCIÓN DIETA VOCAL -->
    <section style="margin:6rem 0; padding:4rem; background:linear-gradient(135deg, rgba(0,255,136,0.05), rgba(124,77,255,0.05)); border-radius:48px; border:1px solid rgba(0,255,136,0.1);">
        <h2 style="font-size:2.5rem; font-weight:900; margin-bottom:1rem;">Tu Dieta <span style="color:#00FF88;">Vocal</span></h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:2rem; margin-top:2rem;">
            <div style="background:rgba(255,255,255,0.02); padding:2rem; border-radius:32px; border:1px solid rgba(255,255,255,0.05);">
                <h4 style="color:#00FF88; text-transform:uppercase; font-size:0.8rem; margin-bottom:1rem;">✅ Alimentos Aliados</h4>
                <ul style="list-style:none; line-height:2.5;">
                    <li>🥥 Agua a temperatura ambiente</li>
                    <li>🍯 Té de Jengibre con Miel silvestre</li>
                    <li>🍉 Frutas con alto contenido de agua</li>
                </ul>
            </div>
            <div style="background:rgba(255,255,255,0.02); padding:2rem; border-radius:32px; border:1px solid rgba(255,255,255,0.05);">
                <h4 style="color:var(--a); text-transform:uppercase; font-size:0.8rem; margin-bottom:1rem;">❌ Evitar antes de cantar</h4>
                <ul style="list-style:none; line-height:2.5;">
                    <li>🍦 Lácteos (generan mucosa densa)</li>
                    <li>☕ Cafeína (deshidrata los pliegues)</li>
                    <li>🌶️ Picante (riesgo de reflujo vocal)</li>
                </ul>
            </div>
        </div>
    </section>
'''

for v in VOICES:
    path = os.path.join(BASE_DIR, v, "index.html")
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<div class="cta-section"' in content or 'class="cta-section"' in content:
            # Inyectamos antes del CTA final
            if 'class="cta-section"' in content:
                parts = content.split('class="cta-section"', 1)
                new_content = parts[0] + GADGETS_HTML + '<div class="cta-section"' + parts[1]
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ Gadgets & Dieta inyectados en {v}")
            elif '<div class="cta-section"' in content:
                parts = content.split('<div class="cta-section"', 1)
                new_content = parts[0] + GADGETS_HTML + '<div class="cta-section"' + parts[1]
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ Gadgets & Dieta inyectados en {v}")
