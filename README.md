# 🧬 CitoLab: Operación Código Génesis
## Simulador y Juego Académico Gamificado de División Celular (4.º ESO)

Una experiencia interactiva inmersiva en HTML5 diseñada específicamente para el currículo de Biología y Geología de **4.º de Educación Secundaria Obligatoria (ESO)**.

---

### 🚀 Cómo abrir y jugar
1. No requiere ninguna instalación, servidor ni conexión a internet.
2. Abre la carpeta:  
   `/Users/davidpratjovani/.gemini/antigravity/scratch/mision-division-celular/`
3. Haz doble clic en el archivo **`index.html`** para ejecutarlo en cualquier navegador moderno (Chrome, Safari, Firefox, Edge).

---

### 🔬 Modelo Biológico Utilizado: Célula $2n = 4$
El juego utiliza un modelo celular unificado y coherente de principio a fin con **2 pares de cromosomas homólogos**:
- **Par 1 (Grande, metacéntrico):**
  - Homólogo Paterno: Azul cobalto (`#2563eb`)
  - Homólogo Materno: Rojo carmín (`#e11d48`)
- **Par 2 (Pequeño, metacéntrico):**
  - Homólogo Paterno: Verde esmeralda (`#059669`)
  - Homólogo Materno: Naranja ámbar (`#d97706`)

---

### 🛡️ Mecánica "Anti-Adivinanza" y Rigor Pedagógico
A diferencia de los cuestionarios tipo test convencionales, el alumnado no puede superar los retos pulsando al azar:
1. **Doble Validación Obligatoria:** Cada pregunta de predicción exige seleccionar una respuesta Y una **justificación científica razonada**.
2. **Manipulación Citoquímica Directa:**
   - **Fase S:** Clicar en cada filamento de cromatina simple para activar la ADN polimerasa y replicar las cromátidas hermanas.
   - **Secuencia Mitótica:** Ordenación manual mediante arrastrar y soltar de las 4 fases.
   - **Placa Metafásica:** Alineación ecuacional individual de cada cinetocoro en el huso.
   - **Entrecruzamiento (*Crossing-Over*):** Clic en los quiasmas en Profase I para intercambiar segmentos homólogos y generar cromátidas recombinadas visibles.
   - **Inspección de Gametos:** Comprobación microscópica de la dotación haploide ($n = 2$) y de la variabilidad genética generada.
3. **Pistas Progresivas:** Dos niveles de pistas conceptuales que orientan al alumno sin revelar de inmediato la solución (con ligera penalización de puntuación para premiar el razonamiento autónomo).

---

### 📚 Estructura de las Misiones
* **Módulo 0 | El Reactor del Ciclo Celular (Interfase):**
  - Comprensión de $G_1$, síntesis en $S$ y comprobación en $G_2$.
  - Distinción fundamental: el número de cromosomas no varía ($2n = 4$), pero se duplica la masa de ADN (de 4 cromátidas a 8 cromátidas hermanas).
* **Módulo 1 | Mitosis: Reparación Tisular y Conservación Genética:**
  - Secuencia de fases (Profase, Metafase, Anafase, Telofase).
  - Alineación ecuacional y disyunción de **cromátidas hermanas**.
  - Balance final: 2 células somáticas clónicas diploides ($2n = 4$).
* **Módulo 2 | Meiosis I: Recombinación y Reducción Cromosómica:**
  - Sinapsis de tétradas / bivalentes y sobrecruzamiento en quiasmas.
  - Separación de **cromosomas homólogos** (reducción a haploidía duplicada: $n = 2$ dobles).
* **Módulo 3 | Meiosis II: División Ecuacional y Gametogénesis:**
  - Ausencia de fase S intermedia.
  - Separación de cromátidas recombinadas.
  - Obtención de 4 gametos haploides ($n = 2$ simples), todos genéticamente distintos.
* **Módulo 4 | Desafío Forense del Microscopio (Evaluación de Integración):**
  - Muestra A: Identificación de anafase mitótica vs meiótica por recuento cromosómico en los polos.
  - Muestra B: Detección de no-disyunción meiótica y consecuencias genéticas (aneuploidías / trisomías como la trisomía 21).
  - Matriz global de contraste: Mitosis vs. Meiosis.
* **Módulo 5 | Informe y Certificación CitoLab:**
  - Desglose porcentual por competencias.
  - Recomendaciones personalizadas de repaso.
  - Opción de imprimir o guardar el informe en PDF.

---

### 🎨 Aspectos Técnicos
- **Audio Sintetizado:** Efectos sonoros procedurales mediante la Web Audio API (no requiere archivos `.mp3` ni enlaces externos). Botón para silenciar disponible en la cabecera.
- **Gráficos SVG Nativos:** Gráficos vectoriales nítidos a cualquier resolución, con bandas cromosómicas, centrómeros, cinetocoros y huso acromático.
- **Diseño Responsivo:** Optimizado para ordenadores de aula de informática y pantallas portátiles.
