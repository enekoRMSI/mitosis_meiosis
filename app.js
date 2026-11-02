/**
 * CitoLab Master Application Controller
 * Gestiona el flujo del juego, estado persistente entre pasos, navegación anterior/siguiente,
 * interactividad táctil (arrastrar, soltar, pulsar) y estética diferenciada Mitosis vs Meiosis.
 */

class CitoLabApp {
    constructor() {
        this.missions = window.MissionsData;
        this.currentMissionIdx = 0;
        this.currentStepIdx = 0;
        this.score = 0;
        this.maxPossibleScore = 1400;
        
        // Historial persistente para mantener lo ya realizado al ir atrás
        this.stepHistory = {}; // Clave: `${mIdx}_${sIdx}` => { completed: true, ... }
        this.furthestMissionIdx = 0;
        this.furthestStepIdx = 0;

        // Competencias diagnósticas (0 a 100%)
        this.competencies = {
            cycle_and_replication: { name: 'Ciclo Celular y Replicación del ADN', total: 0, passed: 0, hints: 0, reviews: [] },
            mitosis_mechanics: { name: 'Mecánica Mitótica y Conservación Diploide', total: 0, passed: 0, hints: 0, reviews: [] },
            meiosis_1_reduction: { name: 'Meiosis I: Crossing-over y Reducción', total: 0, passed: 0, hints: 0, reviews: [] },
            meiosis_2_gametes: { name: 'Meiosis II: Gametos y Variabilidad', total: 0, passed: 0, hints: 0, reviews: [] },
            cytological_diagnosis: { name: 'Diagnóstico Forense y Anomalías', total: 0, passed: 0, hints: 0, reviews: [] }
        };

        // Estado interactivo temporal para el paso en curso
        this.stepState = {};

        // Elementos DOM
        this.dom = {};
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderMission();
    }

    cacheDOM() {
        this.dom.moduleBadge = document.getElementById('moduleBadge');
        this.dom.missionTitle = document.getElementById('missionTitle');
        this.dom.missionSubtitle = document.getElementById('missionSubtitle');
        this.dom.scoreVal = document.getElementById('scoreVal');
        this.dom.progressBar = document.getElementById('progressBar');
        this.dom.progressPercent = document.getElementById('progressPercent');
        this.dom.microscopeStage = document.getElementById('microscopeStage');
        this.dom.panelInstruction = document.getElementById('panelInstruction');
        this.dom.interactionArea = document.getElementById('interactionArea');
        this.dom.feedbackArea = document.getElementById('feedbackArea');
        this.dom.actionButtons = document.getElementById('actionButtons');
        this.dom.audioToggleBtn = document.getElementById('audioToggleBtn');
        this.dom.helpModal = document.getElementById('helpModal');
        this.dom.modalContent = document.getElementById('modalContent');
        this.dom.finalReportModal = document.getElementById('finalReportModal');
        this.dom.reportContainer = document.getElementById('reportContainer');
        this.dom.btnPrevStep = document.getElementById('btnPrevStep');
        this.dom.btnNextStep = document.getElementById('btnNextStep');
        this.dom.stepProgressBadge = document.getElementById('stepProgressBadge');
        this.dom.divisionTypeIndicator = document.getElementById('divisionTypeIndicator');
        this.dom.divisionTypeTitle = document.getElementById('divisionTypeTitle');
        this.dom.divisionTypePloidy = document.getElementById('divisionTypePloidy');
    }

    bindEvents() {
        if (this.dom.btnPrevStep) {
            this.dom.btnPrevStep.addEventListener('click', () => {
                this.goToPreviousStep();
            });
        }

        if (this.dom.btnNextStep) {
            this.dom.btnNextStep.addEventListener('click', () => {
                this.goToNextStep();
            });
        }

        if (this.dom.audioToggleBtn) {
            this.dom.audioToggleBtn.addEventListener('click', () => {
                const enabled = window.labAudio.toggle();
                this.dom.audioToggleBtn.textContent = enabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
                this.dom.audioToggleBtn.classList.toggle('muted', !enabled);
            });
        }

        const closeHelpBtn = document.getElementById('closeHelpBtn');
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => {
                this.dom.helpModal.classList.add('hidden');
            });
        }

        const karyotypeBtn = document.getElementById('karyotypeBtn');
        if (karyotypeBtn) {
            karyotypeBtn.addEventListener('click', () => {
                this.showKaryotypeGuide();
            });
        }
    }

    getStepKey() {
        return `${this.currentMissionIdx}_${this.currentStepIdx}`;
    }

    isCurrentStepCompleted() {
        const key = this.getStepKey();
        return !!(this.stepHistory[key] && this.stepHistory[key].completed);
    }

    canGoNext() {
        if (this.isCurrentStepCompleted()) return true;
        if (this.currentMissionIdx < this.furthestMissionIdx) return true;
        if (this.currentMissionIdx === this.furthestMissionIdx && this.currentStepIdx < this.furthestStepIdx) return true;
        return false;
    }

    goToPreviousStep() {
        window.labAudio.playClick();
        if (this.currentStepIdx > 0) {
            this.currentStepIdx--;
            this.renderMission();
        } else if (this.currentMissionIdx > 0) {
            this.currentMissionIdx--;
            const prevMission = this.getCurrentMission();
            this.currentStepIdx = prevMission ? prevMission.steps.length - 1 : 0;
            this.renderMission();
        }
    }

    goToNextStep() {
        if (!this.canGoNext()) return;
        window.labAudio.playClick();
        const mission = this.getCurrentMission();
        if (this.currentStepIdx < mission.steps.length - 1) {
            this.currentStepIdx++;
            this.renderMission();
        } else if (this.currentMissionIdx < this.missions.length - 1) {
            this.currentMissionIdx++;
            this.currentStepIdx = 0;
            this.renderMission();
        } else {
            this.showFinalReport();
        }
    }

    markCurrentStepCompleted(data = {}) {
        const key = this.getStepKey();
        this.stepHistory[key] = {
            completed: true,
            ...data
        };

        if (this.currentMissionIdx > this.furthestMissionIdx) {
            this.furthestMissionIdx = this.currentMissionIdx;
            this.furthestStepIdx = this.currentStepIdx;
        } else if (this.currentMissionIdx === this.furthestMissionIdx) {
            if (this.currentStepIdx > this.furthestStepIdx) {
                this.furthestStepIdx = this.currentStepIdx;
            }
        }

        this.updateHUD();
    }

    getCurrentMission() {
        return this.missions[this.currentMissionIdx];
    }

    getCurrentStep() {
        const mission = this.getCurrentMission();
        return mission ? mission.steps[this.currentStepIdx] : null;
    }

    updateTheme() {
        const mission = this.getCurrentMission();
        if (!mission) return;

        if (mission.divisionType === 'mitosis') {
            document.body.className = 'theme-mitosis';
            if (this.dom.divisionTypeTitle) this.dom.divisionTypeTitle.textContent = '🔬 DIVISIÓN SOMÁTICA • MITOSIS';
            if (this.dom.divisionTypePloidy) this.dom.divisionTypePloidy.textContent = 'Conservación Diploide (2n → 2n)';
        } else if (mission.divisionType === 'meiosis') {
            document.body.className = 'theme-meiosis';
            if (this.dom.divisionTypeTitle) this.dom.divisionTypeTitle.textContent = '⚡ DIVISIÓN REDUCCIONAL • MEIOSIS';
            if (this.dom.divisionTypePloidy) this.dom.divisionTypePloidy.textContent = 'Reducción y Variabilidad (2n → 4 células n)';
        } else if (mission.divisionType === 'forensic') {
            document.body.className = 'theme-forensic';
            if (this.dom.divisionTypeTitle) this.dom.divisionTypeTitle.textContent = '⚠️ LABORATORIO FORENSE CITOLÓGICO';
            if (this.dom.divisionTypePloidy) this.dom.divisionTypePloidy.textContent = 'Diagnóstico Clínico y Anomalías';
        }
    }

    updateHUD() {
        const mission = this.getCurrentMission();
        if (!mission) return;

        this.updateTheme();

        this.dom.moduleBadge.textContent = mission.badge;
        this.dom.missionTitle.textContent = mission.title;
        this.dom.missionSubtitle.textContent = mission.subtitle;
        this.dom.scoreVal.textContent = this.score;

        if (this.dom.stepProgressBadge) {
            this.dom.stepProgressBadge.textContent = `Paso ${this.currentStepIdx + 1} de ${mission.steps.length}`;
        }

        // Progreso global
        let totalSteps = 0;
        let completedSteps = 0;
        this.missions.forEach((m, mIdx) => {
            m.steps.forEach((s, sIdx) => {
                totalSteps++;
                const k = `${mIdx}_${sIdx}`;
                if (this.stepHistory[k]?.completed) {
                    completedSteps++;
                }
            });
        });

        const percent = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
        this.dom.progressBar.style.width = `${percent}%`;
        this.dom.progressPercent.textContent = `${percent}%`;

        if (this.dom.btnPrevStep) {
            this.dom.btnPrevStep.disabled = (this.currentMissionIdx === 0 && this.currentStepIdx === 0);
        }

        if (this.dom.btnNextStep) {
            this.dom.btnNextStep.disabled = !this.canGoNext();
        }
    }

    renderMission() {
        const mission = this.getCurrentMission();
        if (!mission) {
            this.showFinalReport();
            return;
        }

        const step = this.getCurrentStep();
        if (!step) {
            this.currentMissionIdx++;
            this.currentStepIdx = 0;
            this.renderMission();
            return;
        }

        this.updateHUD();
        this.feedbackAreaClear();

        const stepKey = this.getStepKey();
        const savedState = this.stepHistory[stepKey];

        this.stepState = {
            hintsUsed: 0,
            selectedOption: savedState ? savedState.selectedOption : null,
            selectedReason: savedState ? savedState.selectedReason : null
        };

        // Renderizar según tipo de paso
        switch (step.type) {
            case 'predict_and_reason':
            case 'forensic_case_1':
            case 'forensic_case_2':
            case 'matrix_comparison':
            case 'interactive_segregation_check':
                this.renderPredictAndReason(step, savedState);
                break;
            case 'interactive_replication':
                this.renderInteractiveReplication(step, savedState);
                break;
            case 'order_phases':
                this.renderOrderPhases(step, savedState);
                break;
            case 'interactive_metaphase_plate':
                this.renderMetaphasePlate(step, savedState);
                break;
            case 'interactive_mitosis_anaphase_drag':
                this.renderMitosisAnaphaseDrag(step, savedState);
                break;
            case 'synapsis_pairing':
                this.renderSynapsisPairing(step, savedState);
                break;
            case 'interactive_meiosis1_anaphase_drag':
                this.renderMeiosis1AnaphaseDrag(step, savedState);
                break;
            case 'interactive_gamete_inspector':
                this.renderGameteInspector(step, savedState);
                break;
            case 'interactive_forensic_sorter':
                this.renderForensicSorter(step, savedState);
                break;
            default:
                console.warn('Unknown step type:', step.type);
        }
    }

    feedbackAreaClear() {
        this.dom.feedbackArea.innerHTML = '';
        this.dom.feedbackArea.className = 'feedback-panel empty';
    }

    showFeedback(message, isSuccess = false, hintText = null) {
        this.dom.feedbackArea.className = `feedback-panel ${isSuccess ? 'success' : 'error'}`;
        let html = `<div class="feedback-title">${isSuccess ? '✅ VERIFICACIÓN CORRECTA' : '⚠️ ANOMALÍA DETECTADA'}</div>`;
        html += `<div class="feedback-body">${message}</div>`;
        if (hintText) {
            html += `<div class="feedback-hint">💡 <strong>Pista de Apoyo:</strong> ${hintText}</div>`;
        }
        this.dom.feedbackArea.innerHTML = html;
    }

    // ==========================================================
    // RENDERIZADOR: PREDECIR Y RAZONAR (CON ESTADO GUARDADO)
    // ==========================================================
    renderPredictAndReason(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Instrucción Científica:</strong> ${step.instruction}`;
        this.renderMicroscopeVisual(step.visualState);

        const isCompleted = savedState && savedState.completed;
        const letters = ['A', 'B', 'C', 'D'];
        
        // Si ya estaba completado, mantenemos el orden previo o mostramos tal cual
        let optionsList = step.options;
        if (!isCompleted) {
            optionsList = [...step.options].sort(() => Math.random() - 0.5);
        }

        let optionsHtml = optionsList.map((opt, idx) => {
            const isSelected = savedState && savedState.selectedOption === opt.id;
            return `
                <button class="choice-btn ${isSelected ? 'selected' : ''}" data-id="${opt.id}" ${isCompleted ? 'disabled style="cursor:default"' : ''}>
                    <span class="choice-letter">${letters[idx]}</span>
                    <span class="choice-text">${opt.text}</span>
                </button>
            `;
        }).join('');

        let reasoningsList = step.reasoningOptions;
        if (!isCompleted) {
            reasoningsList = [...step.reasoningOptions].sort(() => Math.random() - 0.5);
        }

        let reasoningsHtml = reasoningsList.map((r, idx) => {
            const isSelected = savedState && savedState.selectedReason === r.id;
            return `
                <button class="choice-btn reason-btn ${isSelected ? 'selected' : ''}" data-id="${r.id}" ${isCompleted ? 'disabled style="cursor:default"' : ''}>
                    <span class="choice-letter">R${idx + 1}</span>
                    <span class="choice-text">${r.text}</span>
                </button>
            `;
        }).join('');

        this.dom.interactionArea.innerHTML = `
            <div class="two-tier-container">
                <div class="tier-section">
                    <div class="tier-label">Nivel 1: Predicción de Respuesta</div>
                    <div class="question-text">${step.question}</div>
                    <div class="choices-list" id="primaryChoices">
                        ${optionsHtml}
                    </div>
                </div>

                <div class="tier-section ${isCompleted ? '' : 'hidden'}" id="reasoningTier">
                    <div class="tier-label">Nivel 2: Justificación Científica Obligatoria</div>
                    <div class="question-text">${step.reasoningPrompt}</div>
                    <div class="choices-list" id="reasoningChoices">
                        ${reasoningsHtml}
                    </div>
                </div>
            </div>
        `;

        if (isCompleted) {
            this.showFeedback(
                `<strong>¡Paso ya superado con rigor biológico!</strong><br>${step.options.find(o => o.id === step.correctOption).text}`,
                true
            );
            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
            `;
            document.getElementById('nextStepBtn').addEventListener('click', () => {
                this.goToNextStep();
            });
            return;
        }

        this.dom.actionButtons.innerHTML = `
            <button class="btn btn-hint" id="requestHintBtn">💡 Solicitar Pista (-20 pts)</button>
            <button class="btn btn-primary" id="validateHypothesisBtn" disabled>🔬 Validar Hipótesis</button>
        `;

        const primaryBtns = document.querySelectorAll('#primaryChoices .choice-btn');
        const reasoningTier = document.getElementById('reasoningTier');
        const reasoningBtns = document.querySelectorAll('#reasoningChoices .reason-btn');
        const validateBtn = document.getElementById('validateHypothesisBtn');
        const hintBtn = document.getElementById('requestHintBtn');

        primaryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.labAudio.playClick();
                primaryBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.stepState.selectedOption = btn.dataset.id;
                reasoningTier.classList.remove('hidden');
            });
        });

        reasoningBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.labAudio.playClick();
                reasoningBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.stepState.selectedReason = btn.dataset.id;
                validateBtn.disabled = false;
            });
        });

        hintBtn.addEventListener('click', () => {
            this.handleHintRequest(step);
        });

        validateBtn.addEventListener('click', () => {
            this.validateTwoTierAnswer(step);
        });
    }

    validateTwoTierAnswer(step) {
        const mission = this.getCurrentMission();
        const comp = this.competencies[mission.competencyKey];
        comp.total++;

        const isOptionCorrect = this.stepState.selectedOption === step.correctOption;
        const isReasonCorrect = this.stepState.selectedReason === step.correctReasoning;

        if (isOptionCorrect && isReasonCorrect) {
            window.labAudio.playSuccess();
            const earnedPoints = Math.max(50, 100 - (this.stepState.hintsUsed * 30));
            this.score += earnedPoints;
            comp.passed++;

            this.markCurrentStepCompleted({
                selectedOption: this.stepState.selectedOption,
                selectedReason: this.stepState.selectedReason
            });

            this.showFeedback(
                `<strong>¡Hipótesis y razonamiento científicamente impecables!</strong> (+${earnedPoints} pts)<br>${step.options.find(o => o.id === step.correctOption).text}`,
                true
            );

            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
            `;
            document.getElementById('nextStepBtn').addEventListener('click', () => {
                this.goToNextStep();
            });

        } else {
            window.labAudio.playError();
            this.score = Math.max(0, this.score - 15);
            this.updateHUD();

            let errorDesc = 'La hipótesis o la justificación científica seleccionada contiene discrepancias con el modelo celular.';
            if (isOptionCorrect && !isReasonCorrect) {
                errorDesc = 'Has acertado la opción, pero la justificación elegida no es el fundamento biológico real. ¡Evita el azar!';
            }
            this.showFeedback(errorDesc, false, step.hint1);
        }
    }

    handleHintRequest(step) {
        this.stepState.hintsUsed = (this.stepState.hintsUsed || 0) + 1;
        const mission = this.getCurrentMission();
        this.competencies[mission.competencyKey].hints++;
        window.labAudio.playClick();

        let hintMsg = (this.stepState.hintsUsed === 1) ? `[Pista 1/2] ${step.hint1}` : `[Pista 2/2] ${step.hint2}`;
        this.score = Math.max(0, this.score - 20);
        this.updateHUD();
        this.showFeedback('Pista activada por el sistema:', false, hintMsg);
    }

    // ==========================================================
    // RENDERIZADOR: REPLICACIÓN INTERACTIVA (FASE S)
    // ==========================================================
    renderInteractiveReplication(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Acción de Laboratorio:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;

        this.stepState.replicatedCount = isCompleted ? 4 : 0;
        this.stepState.replicatedStatus = isCompleted ? [true, true, true, true] : [false, false, false, false];

        const renderSvg = () => {
            const svgContent = `
                <svg viewBox="0 0 540 360" class="microscope-svg">
                    ${CellGraphics.createCellBase(540, 360, { showNuclearEnvelope: true, centriolePosition: 'together' })}
                    <g id="chromatinTargets">
                        ${this.renderInterphaseStrand(0, 180, 140, 75, CellColors.pair1Paternal, 'Par 1 Pat')}
                        ${this.renderInterphaseStrand(1, 360, 140, 75, CellColors.pair1Maternal, 'Par 1 Mat')}
                        ${this.renderInterphaseStrand(2, 210, 230, 48, CellColors.pair2Paternal, 'Par 2 Pat')}
                        ${this.renderInterphaseStrand(3, 330, 230, 48, CellColors.pair2Maternal, 'Par 2 Mat')}
                    </g>
                </svg>
            `;
            this.dom.microscopeStage.innerHTML = svgContent;

            if (!isCompleted) {
                for (let i = 0; i < 4; i++) {
                    const el = document.getElementById(`strand-${i}`);
                    if (el) {
                        el.addEventListener('click', () => {
                            if (!this.stepState.replicatedStatus[i]) {
                                this.stepState.replicatedStatus[i] = true;
                                this.stepState.replicatedCount++;
                                window.labAudio.playSnap();
                                this.score += 25;
                                this.updateHUD();
                                renderSvg();
                                this.checkReplicationFinished(step);
                            }
                        });
                    }
                }
            }
        };

        renderSvg();

        this.dom.interactionArea.innerHTML = `
            <div class="interactive-status-box">
                <div class="status-meter">
                    <span class="status-title">Cromátidas Replicadas por ADN Polimerasa:</span>
                    <span class="status-counter" id="replCounter">${this.stepState.replicatedCount} / 4</span>
                </div>
                <p class="status-guide">${isCompleted ? '✔ Replicación completada: 4 cromosomas duplicados.' : 'Pulsa sobre cada uno de los 4 filamentos de cromatina en el microscopio para activar la ADN polimerasa.'}</p>
            </div>
        `;

        if (isCompleted) {
            this.showFeedback(step.feedbackCompleted, true);
            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
            `;
            document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
        } else {
            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary" id="continueReplBtn" disabled>Replicación Incompleta</button>
            `;
        }
    }

    renderInterphaseStrand(index, x, y, length, color, label) {
        const isReplicated = this.stepState.replicatedStatus[index];
        if (isReplicated) {
            return `
                <g id="strand-${index}" class="clickable-strand replicated" style="cursor: default">
                    ${CellGraphics.createDuplicatedChromosome(x, y, length, color, 0, null, `dup-${index}`)}
                    <text x="${x}" y="${y + length / 2 + 16}" fill="#a7f3d0" font-size="10" text-anchor="middle">✔ Duplicado (2 cromátidas)</text>
                </g>
            `;
        } else {
            return `
                <g id="strand-${index}" class="clickable-strand pulse-strand clickable-interactive-item">
                    ${CellGraphics.createSimpleChromatid(x, y, length, color, 0, null, `simp-${index}`)}
                    <circle cx="${x}" cy="${y}" r="24" fill="none" stroke="#38bdf8" stroke-dasharray="3,3" class="target-ring" />
                    <text x="${x}" y="${y + length / 2 + 16}" fill="#94a3b8" font-size="10" text-anchor="middle">${label} (Tocar para replicar)</text>
                </g>
            `;
        }
    }

    checkReplicationFinished(step) {
        const counterEl = document.getElementById('replCounter');
        if (counterEl) counterEl.textContent = `${this.stepState.replicatedCount} / 4`;

        if (this.stepState.replicatedCount >= 4) {
            window.labAudio.playSuccess();
            this.competencies.cycle_and_replication.passed++;
            this.markCurrentStepCompleted();
            this.showFeedback(step.feedbackCompleted, true);

            const btn = document.getElementById('continueReplBtn');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Siguiente Paso ➡️';
                btn.classList.add('btn-pulse');
                btn.addEventListener('click', () => this.goToNextStep());
            }
        }
    }

    // ==========================================================
    // RENDERIZADOR: ORDENAR FASES (MITOSIS)
    // ==========================================================
    renderOrderPhases(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Secuencia Citoesquelética:</strong> ${step.instruction}`;
        this.renderMicroscopeVisual('mitosis_sequence_overview');

        const isCompleted = savedState && savedState.completed;
        const phasesList = isCompleted ? step.phases : [step.phases[1], step.phases[3], step.phases[0], step.phases[2]];

        let cardsHtml = phasesList.map(p => `
            <div class="phase-order-card" data-id="${p.id}" ${isCompleted ? '' : 'draggable="true"'}>
                <div class="order-handle">☰</div>
                <div class="order-info">
                    <strong class="phase-name">${p.name}</strong>
                    <p class="phase-desc">${p.desc}</p>
                </div>
                <div class="order-badge">Fase</div>
            </div>
        `).join('');

        this.dom.interactionArea.innerHTML = `
            <div class="order-board" id="orderBoard">
                ${cardsHtml}
            </div>
            <div class="order-instructions">${isCompleted ? '✔ Secuencia ordenada y validada.' : 'Arrastra las tarjetas para colocarlas en el orden secuencial correcto (1.º arriba, 4.º abajo).'}</div>
        `;

        if (isCompleted) {
            this.showFeedback('<strong>Secuencia mitótica superada:</strong> Profase ➔ Metafase ➔ Anafase ➔ Telofase.', true);
            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
            `;
            document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
            return;
        }

        this.dom.actionButtons.innerHTML = `
            <button class="btn btn-hint" id="requestHintBtn">💡 Solicitar Pista (-20 pts)</button>
            <button class="btn btn-primary" id="verifyOrderBtn">🔬 Comprobar Secuencia Mitótica</button>
        `;

        this.initOrderBoardInteraction();

        document.getElementById('requestHintBtn').addEventListener('click', () => this.handleHintRequest(step));
        document.getElementById('verifyOrderBtn').addEventListener('click', () => {
            const currentOrder = Array.from(document.querySelectorAll('#orderBoard .phase-order-card')).map(el => el.dataset.id);
            const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(step.correctOrder);
            if (isCorrect) {
                window.labAudio.playSuccess();
                this.score += 100;
                this.competencies.mitosis_mechanics.passed++;
                this.markCurrentStepCompleted();
                this.showFeedback('<strong>¡Secuencia mitótica validada!</strong> Profase ➔ Metafase ➔ Anafase ➔ Telofase.', true);

                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
            } else {
                window.labAudio.playError();
                this.score = Math.max(0, this.score - 15);
                this.updateHUD();
                this.showFeedback('La secuencia cromosómica es incorrecta. Piensa en la mnemotecnia: PROMETO a ANA TEJER.', false, step.hint1);
            }
        });
    }

    initOrderBoardInteraction() {
        const board = document.getElementById('orderBoard');
        let draggedItem = null;

        board.querySelectorAll('.phase-order-card').forEach(card => {
            card.addEventListener('dragstart', () => {
                draggedItem = card;
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => {
                draggedItem = null;
                card.classList.remove('dragging');
            });
        });

        board.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(board, e.clientY);
            if (draggedItem) {
                if (afterElement == null) {
                    board.appendChild(draggedItem);
                } else {
                    board.insertBefore(draggedItem, afterElement);
                }
            }
        });

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.phase-order-card:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }

    // ==========================================================
    // RENDERIZADOR: PLACA METAFÁSICA MITÓTICA (INTERACTIVA)
    // ==========================================================
    renderMetaphasePlate(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Alineación Cinetocórica:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;

        this.stepState.activeChromosomes = [
            { id: 0, length: 75, color: CellColors.pair1Paternal, name: 'Par 1 Pat' },
            { id: 1, length: 75, color: CellColors.pair1Maternal, name: 'Par 1 Mat' },
            { id: 2, length: 48, color: CellColors.pair2Paternal, name: 'Par 2 Pat' },
            { id: 3, length: 48, color: CellColors.pair2Maternal, name: 'Par 2 Mat' }
        ];

        this.stepState.placedSlots = isCompleted ? [...this.stepState.activeChromosomes] : [false, false, false, false];

        const renderSvg = () => {
            const ySlots = [80, 140, 200, 260];
            const cx = 270;

            let slotsSvg = ySlots.map((y, i) => {
                const isOccupied = this.stepState.placedSlots[i];
                if (isOccupied) {
                    const chrom = isOccupied;
                    return CellGraphics.createDuplicatedChromosome(cx, y, chrom.length, chrom.color, 90, null, `placed-${i}`);
                } else {
                    return `
                        <g class="metaphase-slot" data-slot="${i}">
                            <circle cx="${cx}" cy="${y}" r="12" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-dasharray="3,3" />
                            <text x="${cx}" y="${y + 4}" fill="#38bdf8" font-size="9" text-anchor="middle">Placa ${i + 1}</text>
                        </g>
                    `;
                }
            }).join('');

            const svgContent = `
                <svg viewBox="0 0 540 340" class="microscope-svg">
                    ${CellGraphics.createCellBase(540, 340, { spindleFibersToPoles: true, centriolePosition: 'poles' })}
                    <g id="slotsGroup">${slotsSvg}</g>
                </svg>
            `;
            this.dom.microscopeStage.innerHTML = svgContent;
        };

        renderSvg();

        const renderButtons = () => {
            const available = this.stepState.activeChromosomes.filter(c => !this.stepState.placedSlots.includes(c));
            if (available.length === 0 || isCompleted) {
                this.dom.interactionArea.innerHTML = `
                    <div class="interactive-status-box success-border">
                        <div class="status-title">✅ ¡Los 4 cromosomas duplicados están alineados en fila india!</div>
                        <p class="status-guide">${step.checkExplanation}</p>
                    </div>
                `;
                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => {
                    this.markCurrentStepCompleted();
                    this.goToNextStep();
                });
                return;
            }

            let btnsHtml = available.map(c => `
                <button class="chromosome-place-btn" data-id="${c.id}" style="border-left: 6px solid ${c.color}">
                    <span>Alinear en Huso:</span>
                    <strong>${c.name} (${c.length > 50 ? 'Grande' : 'Pequeño'})</strong>
                </button>
            `).join('');

            this.dom.interactionArea.innerHTML = `
                <div class="interactive-status-box">
                    <div class="status-guide">Pulsa sobre cada cromosoma para anclar sus cinetocoros al ecuador:</div>
                    <div class="chrom-buttons-grid">${btnsHtml}</div>
                </div>
            `;

            document.querySelectorAll('.chromosome-place-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    const chrom = this.stepState.activeChromosomes.find(c => c.id === id);
                    const firstEmptySlot = this.stepState.placedSlots.findIndex(s => s === false);
                    if (firstEmptySlot !== -1 && chrom) {
                        this.stepState.placedSlots[firstEmptySlot] = chrom;
                        window.labAudio.playSnap();
                        renderSvg();
                        renderButtons();
                    }
                });
            });
        };

        renderButtons();
    }

    // ==========================================================
    // RENDERIZADOR: ANAFASE MITÓTICA (ARRASTRAR CROMÁTIDAS A LOS POLOS)
    // ==========================================================
    renderMitosisAnaphaseDrag(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Acción de Laboratorio:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;

        this.stepState.leftPoleCount = isCompleted ? 4 : 0;
        this.stepState.rightPoleCount = isCompleted ? 4 : 0;
        this.stepState.chromatids = [
            { id: 'c1', label: 'Cromátida 1P (Larga Azul)', color: CellColors.pair1Paternal, placed: isCompleted ? 'left' : null },
            { id: 'c2', label: 'Cromátida 1P copia (Larga Azul)', color: CellColors.pair1Paternal, placed: isCompleted ? 'right' : null },
            { id: 'c3', label: 'Cromátida 1M (Larga Roja)', color: CellColors.pair1Maternal, placed: isCompleted ? 'left' : null },
            { id: 'c4', label: 'Cromátida 1M copia (Larga Roja)', color: CellColors.pair1Maternal, placed: isCompleted ? 'right' : null },
            { id: 'c5', label: 'Cromátida 2P (Corta Verde)', color: CellColors.pair2Paternal, placed: isCompleted ? 'left' : null },
            { id: 'c6', label: 'Cromátida 2P copia (Corta Verde)', color: CellColors.pair2Paternal, placed: isCompleted ? 'right' : null },
            { id: 'c7', label: 'Cromátida 2M (Corta Naranja)', color: CellColors.pair2Maternal, placed: isCompleted ? 'left' : null },
            { id: 'c8', label: 'Cromátida 2M copia (Corta Naranja)', color: CellColors.pair2Maternal, placed: isCompleted ? 'right' : null }
        ];

        const renderSvg = () => {
            const width = 540, height = 340, cy = 170;
            const leftItems = this.stepState.chromatids.filter(c => c.placed === 'left');
            const rightItems = this.stepState.chromatids.filter(c => c.placed === 'right');
            const unplaced = this.stepState.chromatids.filter(c => !c.placed);

            let leftSvg = leftItems.map((c, i) => CellGraphics.createSimpleChromatid(120, 60 + i * 55, 60, c.color, 90)).join('');
            let rightSvg = rightItems.map((c, i) => CellGraphics.createSimpleChromatid(420, 60 + i * 55, 60, c.color, -90)).join('');
            let centerSvg = unplaced.map((c, i) => CellGraphics.createSimpleChromatid(270, 45 + i * 36, 50, c.color, 0)).join('');

            this.dom.microscopeStage.innerHTML = `
                <svg viewBox="0 0 ${width} ${height}" class="microscope-svg">
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles' })}
                    ${leftSvg}
                    ${centerSvg}
                    ${rightSvg}
                </svg>
            `;
        };

        renderSvg();

        const renderUI = () => {
            const unplaced = this.stepState.chromatids.filter(c => !c.placed);
            if (unplaced.length === 0 || isCompleted) {
                this.dom.interactionArea.innerHTML = `
                    <div class="interactive-status-box success-border">
                        <div class="status-title">✅ ¡Anafase completada con éxito!</div>
                        <p class="status-guide">4 cromátidas individuales han migrado a cada polo celular. Al descondensarse en telofase, cada nueva célula hija dispondrá de 2n = 4 cromosomas simples.</p>
                    </div>
                `;
                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => {
                    this.markCurrentStepCompleted();
                    this.goToNextStep();
                });
                return;
            }

            let chromsHtml = unplaced.map(c => `
                <div class="draggable-chrom-item" data-id="${c.id}" style="border-left: 5px solid ${c.color}">
                    <span>${c.label}</span>
                    <div>
                        <button class="btn-header send-pole-btn" data-id="${c.id}" data-pole="left">👈 Polo Izq</button>
                        <button class="btn-header send-pole-btn" data-id="${c.id}" data-pole="right">Polo Der 👉</button>
                    </div>
                </div>
            `).join('');

            this.dom.interactionArea.innerHTML = `
                <div class="interactive-status-box">
                    <div class="status-guide">Envía 4 cromátidas al Polo Izquierdo y 4 al Polo Derecho:</div>
                    <div class="poles-container-grid">
                        <div class="pole-dropzone">
                            <span class="dropzone-title">Polo Izquierdo (${this.stepState.leftPoleCount} / 4)</span>
                        </div>
                        <div class="pole-dropzone">
                            <span class="dropzone-title">Polo Derecho (${this.stepState.rightPoleCount} / 4)</span>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                        ${chromsHtml}
                    </div>
                </div>
            `;

            document.querySelectorAll('.send-pole-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const pole = btn.dataset.pole;
                    const item = this.stepState.chromatids.find(c => c.id === id);

                    if (pole === 'left' && this.stepState.leftPoleCount < 4) {
                        item.placed = 'left';
                        this.stepState.leftPoleCount++;
                        window.labAudio.playSnap();
                    } else if (pole === 'right' && this.stepState.rightPoleCount < 4) {
                        item.placed = 'right';
                        this.stepState.rightPoleCount++;
                        window.labAudio.playSnap();
                    }
                    renderSvg();
                    renderUI();
                });
            });
        };

        renderUI();
    }

    // ==========================================================
    // RENDERIZADOR: SINAPSIS Y CROSSING-OVER (MEIOSIS I)
    // ==========================================================
    renderSynapsisPairing(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Mecánica Meiótica:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;

        this.stepState.pair1Done = isCompleted;
        this.stepState.pair2Done = isCompleted;
        this.stepState.chiasma1Done = isCompleted;
        this.stepState.chiasma2Done = isCompleted;

        const renderSvg = () => {
            const svgContent = `
                <svg viewBox="0 0 540 340" class="microscope-svg">
                    ${CellGraphics.createCellBase(540, 340, { showNuclearEnvelope: true, nuclearEnvelopeDissolving: true, centriolePosition: 'poles' })}
                    
                    <!-- Bivalente 1 (Grande) -->
                    <g transform="translate(180, 160)">
                        <text x="0" y="-75" fill="#f8fafc" font-size="11" text-anchor="middle" font-weight="bold">Bivalente 1 (Homólogos Grandes)</text>
                        ${CellGraphics.createDuplicatedChromosome(this.stepState.pair1Done ? -20 : -45, 0, 80, CellColors.pair1Paternal, 0, this.stepState.chiasma1Done ? { sister2: CellColors.pair1Maternal } : null, 't1-p')}
                        ${CellGraphics.createDuplicatedChromosome(this.stepState.pair1Done ? 20 : 45, 0, 80, CellColors.pair1Maternal, 0, this.stepState.chiasma1Done ? { sister1: CellColors.pair1Paternal } : null, 't1-m')}
                        
                        ${this.stepState.pair1Done && !this.stepState.chiasma1Done ? `
                            <g class="chiasma-trigger" id="chiasma1Btn" cursor="pointer">
                                <circle cx="0" cy="22" r="14" fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" stroke-dasharray="3,3" />
                                <text x="0" y="26" fill="#fff" font-size="9" text-anchor="middle">Quiasma 1</text>
                            </g>
                        ` : ''}
                        ${this.stepState.chiasma1Done ? `
                            <circle cx="0" cy="22" r="6" fill="#10b981" />
                            <text x="0" y="38" fill="#34d399" font-size="9" text-anchor="middle">✔ Recombinado</text>
                        ` : ''}
                    </g>

                    <!-- Bivalente 2 (Pequeño) -->
                    <g transform="translate(370, 160)">
                        <text x="0" y="-60" fill="#f8fafc" font-size="11" text-anchor="middle" font-weight="bold">Bivalente 2 (Homólogos Pequeños)</text>
                        ${CellGraphics.createDuplicatedChromosome(this.stepState.pair2Done ? -18 : -40, 0, 52, CellColors.pair2Paternal, 0, this.stepState.chiasma2Done ? { sister2: CellColors.pair2Maternal } : null, 't2-p')}
                        ${CellGraphics.createDuplicatedChromosome(this.stepState.pair2Done ? 18 : 40, 0, 52, CellColors.pair2Maternal, 0, this.stepState.chiasma2Done ? { sister1: CellColors.pair2Paternal } : null, 't2-m')}
                        
                        ${this.stepState.pair2Done && !this.stepState.chiasma2Done ? `
                            <g class="chiasma-trigger" id="chiasma2Btn" cursor="pointer">
                                <circle cx="0" cy="14" r="13" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" stroke-dasharray="3,3" />
                                <text x="0" y="18" fill="#fff" font-size="9" text-anchor="middle">Quiasma 2</text>
                            </g>
                        ` : ''}
                        ${this.stepState.chiasma2Done ? `
                            <circle cx="0" cy="14" r="6" fill="#10b981" />
                            <text x="0" y="30" fill="#34d399" font-size="9" text-anchor="middle">✔ Recombinado</text>
                        ` : ''}
                    </g>
                </svg>
            `;
            this.dom.microscopeStage.innerHTML = svgContent;

            const c1 = document.getElementById('chiasma1Btn');
            if (c1) {
                c1.addEventListener('click', () => {
                    this.stepState.chiasma1Done = true;
                    window.labAudio.playCrossingOver();
                    this.score += 40;
                    this.updateHUD();
                    renderSvg();
                    checkAllDone();
                });
            }

            const c2 = document.getElementById('chiasma2Btn');
            if (c2) {
                c2.addEventListener('click', () => {
                    this.stepState.chiasma2Done = true;
                    window.labAudio.playCrossingOver();
                    this.score += 40;
                    this.updateHUD();
                    renderSvg();
                    checkAllDone();
                });
            }
        };

        const checkAllDone = () => {
            if (this.stepState.chiasma1Done && this.stepState.chiasma2Done) {
                window.labAudio.playSuccess();
                this.competencies.meiosis_1_reduction.passed++;
                this.markCurrentStepCompleted();
                this.showFeedback('<strong>¡Sinapsis y recombinación génica completadas!</strong> Las cromátidas ahora poseen combinaciones alélicas mosaico.', true);
                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
            }
        };

        renderSvg();

        const renderUI = () => {
            if (isCompleted || (this.stepState.chiasma1Done && this.stepState.chiasma2Done)) {
                this.dom.interactionArea.innerHTML = `
                    <div class="interactive-status-box success-border">
                        <div class="status-title">✅ ¡Bivalentes emparejados y recombinados!</div>
                        <p class="status-guide">${step.educationalNote}</p>
                    </div>
                `;
                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
                return;
            }

            this.dom.interactionArea.innerHTML = `
                <div class="interactive-status-box">
                    <div class="status-guide">Fase 1: Pulsa para emparejar los homólogos en tétradas (Sinapsis):</div>
                    <div class="synapsis-pair-box">
                        <div class="synapsis-item ${this.stepState.pair1Done ? 'paired' : ''}" id="pair1Action">
                            <strong>Par 1: Emparejar Homólogo Grande Azul y Rojo</strong>
                            <span>${this.stepState.pair1Done ? '✔ Bivalente 1 Formado' : '👉 Tocar para unir'}</span>
                        </div>
                        <div class="synapsis-item ${this.stepState.pair2Done ? 'paired' : ''}" id="pair2Action">
                            <strong>Par 2: Emparejar Homólogo Pequeño Verde y Naranja</strong>
                            <span>${this.stepState.pair2Done ? '✔ Bivalente 2 Formado' : '👉 Tocar para unir'}</span>
                        </div>
                    </div>
                    <div class="note-box" style="margin-top:10px;">
                        Fase 2: Una vez unidos, pulsa en los <strong>Quiasmas</strong> que aparecen en el microscopio para activar el sobrecruzamiento.
                    </div>
                </div>
            `;

            const p1 = document.getElementById('pair1Action');
            if (p1) {
                p1.addEventListener('click', () => {
                    if (!this.stepState.pair1Done) {
                        this.stepState.pair1Done = true;
                        window.labAudio.playSnap();
                        renderSvg();
                        renderUI();
                    }
                });
            }

            const p2 = document.getElementById('pair2Action');
            if (p2) {
                p2.addEventListener('click', () => {
                    if (!this.stepState.pair2Done) {
                        this.stepState.pair2Done = true;
                        window.labAudio.playSnap();
                        renderSvg();
                        renderUI();
                    }
                });
            }
        };

        renderUI();
    }

    // ==========================================================
    // RENDERIZADOR: ANAFASE I MEIÓTICA (ARRASTRAR HOMÓLOGOS COMPLETOS)
    // ==========================================================
    renderMeiosis1AnaphaseDrag(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Acción de Laboratorio:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;

        this.stepState.leftItems = isCompleted ? 2 : 0;
        this.stepState.rightItems = isCompleted ? 2 : 0;
        this.stepState.chromosomes = [
            { id: 'h1', label: 'Cromosoma Doble Par 1 (Grande Paterno)', length: 75, color: CellColors.pair1Paternal, placed: isCompleted ? 'left' : null },
            { id: 'h2', label: 'Cromosoma Doble Par 1 (Grande Materno)', length: 75, color: CellColors.pair1Maternal, placed: isCompleted ? 'right' : null },
            { id: 'h3', label: 'Cromosoma Doble Par 2 (Pequeño Paterno)', length: 48, color: CellColors.pair2Paternal, placed: isCompleted ? 'left' : null },
            { id: 'h4', label: 'Cromosoma Doble Par 2 (Pequeño Materno)', length: 48, color: CellColors.pair2Maternal, placed: isCompleted ? 'right' : null }
        ];

        const renderSvg = () => {
            const width = 540, height = 340;
            const leftC = this.stepState.chromosomes.filter(c => c.placed === 'left');
            const rightC = this.stepState.chromosomes.filter(c => c.placed === 'right');
            const centerC = this.stepState.chromosomes.filter(c => !c.placed);

            let leftSvg = leftC.map((c, i) => CellGraphics.createDuplicatedChromosome(130, 110 + i * 110, c.length, c.color, 90)).join('');
            let rightSvg = rightC.map((c, i) => CellGraphics.createDuplicatedChromosome(410, 110 + i * 110, c.length, c.color, -90)).join('');
            let centerSvg = centerC.map((c, i) => CellGraphics.createDuplicatedChromosome(270, 70 + i * 70, c.length, c.color, 0)).join('');

            this.dom.microscopeStage.innerHTML = `
                <svg viewBox="0 0 ${width} ${height}" class="microscope-svg">
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles' })}
                    ${leftSvg}
                    ${centerSvg}
                    ${rightSvg}
                </svg>
            `;
        };

        renderSvg();

        const renderUI = () => {
            const unplaced = this.stepState.chromosomes.filter(c => !c.placed);
            if (unplaced.length === 0 || isCompleted) {
                this.dom.interactionArea.innerHTML = `
                    <div class="interactive-status-box success-border">
                        <div class="status-title">✅ ¡Disyunción meiótica completada!</div>
                        <p class="status-guide">${step.checkExplanation}</p>
                    </div>
                `;
                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => {
                    this.markCurrentStepCompleted();
                    this.goToNextStep();
                });
                return;
            }

            let btnsHtml = unplaced.map(c => `
                <div class="draggable-chrom-item" data-id="${c.id}" style="border-left: 5px solid ${c.color}">
                    <span>${c.label}</span>
                    <div>
                        <button class="btn-header send-pole-btn" data-id="${c.id}" data-pole="left">👈 Polo Izq</button>
                        <button class="btn-header send-pole-btn" data-id="${c.id}" data-pole="right">Polo Der 👉</button>
                    </div>
                </div>
            `).join('');

            this.dom.interactionArea.innerHTML = `
                <div class="interactive-status-box">
                    <div class="status-guide">Reparte 1 cromosoma de cada par a cada polo:</div>
                    <div class="poles-container-grid">
                        <div class="pole-dropzone">
                            <span class="dropzone-title">Polo Izquierdo (${this.stepState.leftItems} / 2 cromosomas)</span>
                        </div>
                        <div class="pole-dropzone">
                            <span class="dropzone-title">Polo Derecho (${this.stepState.rightItems} / 2 cromosomas)</span>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                        ${btnsHtml}
                    </div>
                </div>
            `;

            document.querySelectorAll('.send-pole-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const pole = btn.dataset.pole;
                    const item = this.stepState.chromosomes.find(c => c.id === id);

                    if (pole === 'left' && this.stepState.leftItems < 2) {
                        item.placed = 'left';
                        this.stepState.leftItems++;
                        window.labAudio.playSnap();
                    } else if (pole === 'right' && this.stepState.rightItems < 2) {
                        item.placed = 'right';
                        this.stepState.rightItems++;
                        window.labAudio.playSnap();
                    }
                    renderSvg();
                    renderUI();
                });
            });
        };

        renderUI();
    }

    // ==========================================================
    // RENDERIZADOR: INSPECCIÓN DE GAMETOS RESULTANTES (MEIOSIS II)
    // ==========================================================
    renderGameteInspector(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Inspección de Variabilidad Genética:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;
        this.stepState.inspected = isCompleted ? [true, true, true, true] : [false, false, false, false];

        const gameteConfigs = [
            { id: 0, label: 'Gameto 1', long: CellColors.pair1Paternal, longRecomb: null, short: CellColors.pair2Paternal, shortRecomb: null },
            { id: 1, label: 'Gameto 2', long: CellColors.pair1Paternal, longRecomb: CellColors.pair1Maternal, short: CellColors.pair2Maternal, shortRecomb: null },
            { id: 2, label: 'Gameto 3', long: CellColors.pair1Maternal, longRecomb: CellColors.pair1Paternal, short: CellColors.pair2Paternal, shortRecomb: CellColors.pair2Maternal },
            { id: 3, label: 'Gameto 4', long: CellColors.pair1Maternal, longRecomb: null, short: CellColors.pair2Maternal, shortRecomb: CellColors.pair2Paternal }
        ];

        const renderSvg = () => {
            const positions = [
                { x: 140, y: 100 },
                { x: 400, y: 100 },
                { x: 140, y: 250 },
                { x: 400, y: 250 }
            ];

            let gametesSvg = gameteConfigs.map((g, i) => {
                const pos = positions[i];
                const isInspected = this.stepState.inspected[i];
                const strokeColor = isInspected ? '#10b981' : '#d946ef';

                return `
                    <g transform="translate(${pos.x}, ${pos.y})" class="gamete-cell-group" id="gamete-${i}" style="cursor: pointer">
                        <ellipse cx="0" cy="0" rx="85" ry="55" fill="rgba(15, 23, 42, 0.85)" stroke="${strokeColor}" stroke-width="${isInspected ? 3 : 1.8}" stroke-dasharray="${isInspected ? 'none' : '4,4'}" />
                        <ellipse cx="0" cy="0" rx="60" ry="38" fill="rgba(147, 51, 234, 0.08)" stroke="rgba(168, 85, 247, 0.4)" stroke-width="1.2" />
                        ${CellGraphics.createSimpleChromatid(-20, 0, 48, g.long, -10, g.longRecomb)}
                        ${CellGraphics.createSimpleChromatid(20, 0, 32, g.short, 12, g.shortRecomb)}
                        <text x="0" y="48" fill="${isInspected ? '#34d399' : '#f0abfc'}" font-size="10" text-anchor="middle" font-weight="bold">
                            ${g.label} (n = 2) ${isInspected ? '✔' : ''}
                        </text>
                    </g>
                `;
            }).join('');

            this.dom.microscopeStage.innerHTML = `
                <svg viewBox="0 0 540 340" class="microscope-svg">
                    <rect x="0" y="0" width="540" height="340" fill="#090d16" />
                    <line x1="270" y1="20" x2="270" y2="320" stroke="rgba(217, 70, 239, 0.2)" stroke-width="1" />
                    <line x1="20" y1="175" x2="520" y2="175" stroke="rgba(217, 70, 239, 0.2)" stroke-width="1" />
                    ${gametesSvg}
                </svg>
            `;

            if (!isCompleted) {
                gameteConfigs.forEach((g, i) => {
                    const el = document.getElementById(`gamete-${i}`);
                    if (el) {
                        el.addEventListener('click', () => {
                            if (!this.stepState.inspected[i]) {
                                this.stepState.inspected[i] = true;
                                window.labAudio.playSnap();
                                this.score += 20;
                                this.updateHUD();
                                renderSvg();
                                checkAllInspected();
                            }
                        });
                    }
                });
            }
        };

        const checkAllInspected = () => {
            const allChecked = this.stepState.inspected.every(v => v === true);
            if (allChecked) {
                window.labAudio.playSuccess();
                this.competencies.meiosis_2_gametes.passed++;
                this.markCurrentStepCompleted();
                this.showFeedback(step.feedbackCompleted, true);

                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
            }
        };

        renderSvg();

        this.dom.interactionArea.innerHTML = `
            <div class="interactive-status-box">
                <div class="status-guide">${step.subInstruction}</div>
                <div class="note-box">
                    <strong>Ploidía certificada:</strong> Cada gameto contiene exactamente 2 cromosomas simples (n = 2: 1 del par largo y 1 del par corto). Las 4 combinaciones cromosómicas son genéticamente irrepetibles gracias al crossing-over.
                </div>
            </div>
        `;

        if (isCompleted) {
            this.showFeedback(step.feedbackCompleted, true);
            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
            `;
            document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
        } else {
            this.dom.actionButtons.innerHTML = `
                <button class="btn btn-primary" disabled>Inspecciona los 4 Gametos en el Visor</button>
            `;
        }
    }

    // ==========================================================
    // RENDERIZADOR: CLASIFICADOR FORENSE (ARRASTRAR TARJETAS)
    // ==========================================================
    renderForensicSorter(step, savedState = null) {
        this.dom.panelInstruction.innerHTML = `<strong>Análisis de Laboratorio:</strong> ${step.instruction}`;
        const isCompleted = savedState && savedState.completed;

        this.stepState.placedSamples = isCompleted ? { s1: 'mitosis', s2: 'meiosis1', s3: 'aneuploidy' } : {};

        const checkFinished = () => {
            const allAssigned = step.samples.every(s => this.stepState.placedSamples[s.id]);
            if (allAssigned) {
                const allCorrect = step.samples.every(s => this.stepState.placedSamples[s.id] === s.target);
                if (allCorrect) {
                    window.labAudio.playSuccess();
                    this.score += 80;
                    this.markCurrentStepCompleted();
                    this.showFeedback(step.feedbackCompleted, true);
                    this.dom.actionButtons.innerHTML = `
                        <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                    `;
                    document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
                } else {
                    window.labAudio.playError();
                    this.showFeedback('Alguna muestra ha sido clasificada incorrectamente. Revisa la cantidad y tipo de cromosomas que migran a los polos.', false);
                }
            }
        };

        const renderUI = () => {
            let traysHtml = step.trays.map(t => {
                const assignedSample = step.samples.find(s => this.stepState.placedSamples[s.id] === t.id);
                return `
                    <div class="sorter-tray" data-tray="${t.id}">
                        <strong style="color:#f59e0b">${t.name}</strong>
                        <span style="font-size:0.75rem; color:#94a3b8">${t.desc}</span>
                        ${assignedSample ? `
                            <div class="sorter-card" style="border-color:#10b981; background:#0f291e">
                                <strong>${assignedSample.title}</strong>
                            </div>
                        ` : `<div style="color:#64748b; font-style:italic; margin-top:8px;">(Bandeja vacía)</div>`}
                    </div>
                `;
            }).join('');

            const unplaced = step.samples.filter(s => !this.stepState.placedSamples[s.id]);
            let samplesHtml = unplaced.map(s => `
                <div class="sorter-card" data-id="${s.id}">
                    <strong>${s.title}</strong>
                    <p style="font-size:0.75rem; color:#cbd5e1; margin-top:4px;">${s.label}</p>
                    <div style="margin-top:6px; display:flex; gap:6px;">
                        <button class="btn-header sort-btn" data-id="${s.id}" data-target="mitosis">Mitosis</button>
                        <button class="btn-header sort-btn" data-id="${s.id}" data-target="meiosis1">Meiosis I</button>
                        <button class="btn-header sort-btn" data-id="${s.id}" data-target="aneuploidy">Aneuploidía</button>
                    </div>
                </div>
            `).join('');

            this.dom.interactionArea.innerHTML = `
                <div class="interactive-status-box">
                    <div class="status-guide">Asigna cada muestra citológica a su categoría biomédica:</div>
                    <div class="sorter-trays-grid">
                        ${traysHtml}
                    </div>
                    <div style="margin-top:14px; display:flex; flex-direction:column; gap:8px;">
                        ${samplesHtml}
                    </div>
                </div>
            `;

            if (isCompleted) {
                this.showFeedback(step.feedbackCompleted, true);
                this.dom.actionButtons.innerHTML = `
                    <button class="btn btn-primary btn-pulse" id="nextStepBtn">Siguiente Paso ➡️</button>
                `;
                document.getElementById('nextStepBtn').addEventListener('click', () => this.goToNextStep());
                return;
            }

            document.querySelectorAll('.sort-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const target = btn.dataset.target;
                    this.stepState.placedSamples[id] = target;
                    window.labAudio.playSnap();
                    renderUI();
                    checkFinished();
                });
            });
        };

        renderUI();
        this.renderMicroscopeVisual('forensic_sample_alpha');
    }

    // ==========================================================
    // RENDERIZADO VISUAL DEL MICROSCOPIO
    // ==========================================================
    renderMicroscopeVisual(state) {
        let svgBody = '';
        const width = 540;
        const height = 340;
        const cx = width / 2;
        const cy = height / 2;

        switch (state) {
            case 'interphase_g1':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { showNuclearEnvelope: true, centriolePosition: 'together' })}
                    ${CellGraphics.createSimpleChromatid(cx - 60, cy - 35, 75, CellColors.pair1Paternal, -15)}
                    ${CellGraphics.createSimpleChromatid(cx + 60, cy - 35, 75, CellColors.pair1Maternal, 20)}
                    ${CellGraphics.createSimpleChromatid(cx - 40, cy + 35, 48, CellColors.pair2Paternal, 35)}
                    ${CellGraphics.createSimpleChromatid(cx + 40, cy + 35, 48, CellColors.pair2Maternal, -25)}
                    <text x="${cx}" y="${cy + 85}" fill="#64748b" font-size="11" text-anchor="middle">Fase G1: 4 cromosomas simples no replicados</text>
                `;
                break;

            case 'mitosis_sequence_overview':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { showNuclearEnvelope: true, nuclearEnvelopeDissolving: true, centriolePosition: 'poles' })}
                    ${CellGraphics.createDuplicatedChromosome(cx - 50, cy - 40, 75, CellColors.pair1Paternal, 15)}
                    ${CellGraphics.createDuplicatedChromosome(cx + 50, cy - 40, 75, CellColors.pair1Maternal, -20)}
                    ${CellGraphics.createDuplicatedChromosome(cx - 30, cy + 40, 48, CellColors.pair2Paternal, -30)}
                    ${CellGraphics.createDuplicatedChromosome(cx + 30, cy + 40, 48, CellColors.pair2Maternal, 25)}
                `;
                break;

            case 'mitosis_anaphase_view':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles' })}
                    ${CellGraphics.createSimpleChromatid(130, cy - 65, 70, CellColors.pair1Paternal, 90)}
                    ${CellGraphics.createSimpleChromatid(130, cy - 20, 70, CellColors.pair1Maternal, 90)}
                    ${CellGraphics.createSimpleChromatid(130, cy + 25, 45, CellColors.pair2Paternal, 90)}
                    ${CellGraphics.createSimpleChromatid(130, cy + 65, 45, CellColors.pair2Maternal, 90)}
                    ${CellGraphics.createSimpleChromatid(width - 130, cy - 65, 70, CellColors.pair1Paternal, -90)}
                    ${CellGraphics.createSimpleChromatid(width - 130, cy - 20, 70, CellColors.pair1Maternal, -90)}
                    ${CellGraphics.createSimpleChromatid(width - 130, cy + 25, 45, CellColors.pair2Paternal, -90)}
                    ${CellGraphics.createSimpleChromatid(width - 130, cy + 65, 45, CellColors.pair2Maternal, -90)}
                    <text x="${cx}" y="30" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">Anafase Mitótica: Disyunción de Cromátidas Hermanas</text>
                `;
                break;

            case 'meiosis_metaphase_1_plate':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles', membraneColor: CellColors.membraneMeiosis, membraneGlow: 'rgba(217, 70, 239, 0.4)' })}
                    ${CellGraphics.createDuplicatedChromosome(cx - 24, cy - 50, 75, CellColors.pair1Paternal, 90, { sister2: CellColors.pair1Maternal })}
                    ${CellGraphics.createDuplicatedChromosome(cx + 24, cy - 50, 75, CellColors.pair1Maternal, 90, { sister1: CellColors.pair1Paternal })}
                    ${CellGraphics.createDuplicatedChromosome(cx - 22, cy + 50, 50, CellColors.pair2Paternal, 90, { sister2: CellColors.pair2Maternal })}
                    ${CellGraphics.createDuplicatedChromosome(cx + 22, cy + 50, 50, CellColors.pair2Maternal, 90, { sister1: CellColors.pair2Paternal })}
                    <text x="${cx}" y="25" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">Metafase I: Cromosomas Homólogos en Parejas (Bivalentes)</text>
                `;
                break;

            case 'meiosis_1_products':
                svgBody = `
                    <rect x="0" y="0" width="${width}" height="${height}" fill="#0b1120" />
                    <g transform="translate(145, ${cy})">
                        <ellipse cx="0" cy="0" rx="100" ry="80" fill="none" stroke="#d946ef" stroke-width="2" />
                        <ellipse cx="0" cy="0" rx="75" ry="55" fill="rgba(147, 51, 234, 0.1)" stroke="rgba(168, 85, 247, 0.5)" stroke-width="1.5" stroke-dasharray="4,4" />
                        ${CellGraphics.createDuplicatedChromosome(-22, 0, 68, CellColors.pair1Paternal, 15, { sister2: CellColors.pair1Maternal })}
                        ${CellGraphics.createDuplicatedChromosome(22, 0, 45, CellColors.pair2Maternal, -20, { sister1: CellColors.pair2Paternal })}
                        <text x="0" y="68" fill="#f0abfc" font-size="10" text-anchor="middle">Célula A (n = 2 dobles)</text>
                    </g>
                    <g transform="translate(395, ${cy})">
                        <ellipse cx="0" cy="0" rx="100" ry="80" fill="none" stroke="#d946ef" stroke-width="2" />
                        <ellipse cx="0" cy="0" rx="75" ry="55" fill="rgba(147, 51, 234, 0.1)" stroke="rgba(168, 85, 247, 0.5)" stroke-width="1.5" stroke-dasharray="4,4" />
                        ${CellGraphics.createDuplicatedChromosome(-22, 0, 68, CellColors.pair1Maternal, -15, { sister1: CellColors.pair1Paternal })}
                        ${CellGraphics.createDuplicatedChromosome(22, 0, 45, CellColors.pair2Paternal, 20, { sister2: CellColors.pair2Maternal })}
                        <text x="0" y="68" fill="#f0abfc" font-size="10" text-anchor="middle">Célula B (n = 2 dobles)</text>
                    </g>
                `;
                break;

            case 'meiosis_2_scheme':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles', membraneColor: CellColors.membraneMeiosis, membraneGlow: 'rgba(217, 70, 239, 0.4)' })}
                    ${CellGraphics.createDuplicatedChromosome(cx, cy - 45, 75, CellColors.pair1Paternal, 90, { sister2: CellColors.pair1Maternal })}
                    ${CellGraphics.createDuplicatedChromosome(cx, cy + 45, 50, CellColors.pair2Maternal, 90, { sister1: CellColors.pair2Paternal })}
                    <text x="${cx}" y="25" fill="#facc15" font-size="11" font-weight="bold" text-anchor="middle">División Ecuacional sin replicación previa (n = 2)</text>
                `;
                break;

            case 'forensic_sample_alpha':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles' })}
                    ${CellGraphics.createSimpleChromatid(125, cy - 60, 70, CellColors.pair1Paternal, 90)}
                    ${CellGraphics.createSimpleChromatid(125, cy - 20, 70, CellColors.pair1Maternal, 90)}
                    ${CellGraphics.createSimpleChromatid(125, cy + 20, 45, CellColors.pair2Paternal, 90)}
                    ${CellGraphics.createSimpleChromatid(125, cy + 60, 45, CellColors.pair2Maternal, 90)}
                    ${CellGraphics.createSimpleChromatid(width - 125, cy - 60, 70, CellColors.pair1Paternal, -90)}
                    ${CellGraphics.createSimpleChromatid(width - 125, cy - 20, 70, CellColors.pair1Maternal, -90)}
                    ${CellGraphics.createSimpleChromatid(width - 125, cy + 20, 45, CellColors.pair2Paternal, -90)}
                    ${CellGraphics.createSimpleChromatid(width - 125, cy + 60, 45, CellColors.pair2Maternal, -90)}
                    <text x="${cx}" y="25" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">MUESTRA ALFA: Observación en Campo Oscuro</text>
                `;
                break;

            case 'forensic_sample_nondisjunction':
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { spindleFibersToPoles: true, centriolePosition: 'poles', membraneColor: '#f59e0b', membraneGlow: 'rgba(245, 158, 11, 0.4)' })}
                    ${CellGraphics.createDuplicatedChromosome(140, cy - 60, 70, CellColors.pair1Paternal, 90)}
                    ${CellGraphics.createDuplicatedChromosome(140, cy, 70, CellColors.pair1Maternal, 90)}
                    ${CellGraphics.createDuplicatedChromosome(140, cy + 60, 45, CellColors.pair2Paternal, 90)}
                    <text x="140" y="${cy + 105}" fill="#f87171" font-size="10" text-anchor="middle">Polo Izq: Recibe 3 cromosomas</text>
                    ${CellGraphics.createDuplicatedChromosome(width - 140, cy, 45, CellColors.pair2Maternal, -90)}
                    <text x="${width - 140}" y="${cy + 105}" fill="#f87171" font-size="10" text-anchor="middle">Polo Der: Recibe 1 cromosoma</text>
                    <text x="${cx}" y="25" fill="#f43f5e" font-size="12" font-weight="bold" text-anchor="middle">⚠️ ANOMALÍA: No-Disyunción de Homólogos del Par 1</text>
                `;
                break;

            default:
                svgBody = `
                    ${CellGraphics.createCellBase(width, height, { showNuclearEnvelope: true, centriolePosition: 'together' })}
                `;
        }

        this.dom.microscopeStage.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" class="microscope-svg">
                ${svgBody}
            </svg>
        `;
    }

    // ==========================================================
    // GUÍA CIENTÍFICA / CARIOTIPO EN MODAL
    // ==========================================================
    showKaryotypeGuide() {
        window.labAudio.playClick();
        this.dom.modalContent.innerHTML = `
            <h2>🔬 Guía Científica del Laboratorio (Célula Modelo 2n = 4)</h2>
            <p>Para resolver con rigor los retos citológicos, ten siempre presente esta referencia biomédica:</p>
            <div class="karyotype-legend-grid">
                <div class="legend-card" style="border-left: 4px solid #2563eb">
                    <strong>Par 1 Paterno (Grande)</strong>
                    <p>Color azul cobalto. Autosómico grande portador de alelos paternos.</p>
                </div>
                <div class="legend-card" style="border-left: 4px solid #e11d48">
                    <strong>Par 1 Materno (Grande)</strong>
                    <p>Color rojo carmín. Homólogo del par 1 con idénticos loci génicos pero alelos maternos.</p>
                </div>
                <div class="legend-card" style="border-left: 4px solid #059669">
                    <strong>Par 2 Paterno (Pequeño)</strong>
                    <p>Color verde esmeralda. Cromosoma corto con centrómero metacéntrico.</p>
                </div>
                <div class="legend-card" style="border-left: 4px solid #d97706">
                    <strong>Par 2 Materno (Pequeño)</strong>
                    <p>Color naranja ámbar. Homólogo del par 2 proveniente del gameto materno.</p>
                </div>
            </div>
            <div class="key-rules-list">
                <h3>Reglas de Oro en 4.º de ESO:</h3>
                <ul>
                    <li><strong>Cromosoma simple:</strong> Formado por 1 sola cromátida (1 molécula de ADN). Ocurre en G1 y tras la anafase.</li>
                    <li><strong>Cromosoma duplicado:</strong> Formado por 2 cromátidas hermanas idénticas unidas por el centrómero (2 moléculas de ADN). Se genera en fase S.</li>
                    <li><strong>Diploide (2n):</strong> La célula posee 2 ejemplares de cada cromosoma (parejas de homólogos). En nuestra célula: 2n = 4.</li>
                    <li><strong>Haploide (n):</strong> La célula posee un único ejemplar de cada tipo. En nuestra célula: n = 2.</li>
                    <li><strong>Mitosis:</strong> Separa cromátidas hermanas. Genera 2 células diploides idénticas (2n = 4).</li>
                    <li><strong>Meiosis I:</strong> Separa cromosomas homólogos. Reduce la dotación a haploide (n = 2 dobles).</li>
                    <li><strong>Meiosis II:</strong> Separa cromátidas recombinadas sin duplicación previa de ADN. Genera 4 gametos haploides únicos (n = 2 simples).</li>
                </ul>
            </div>
        `;
        this.dom.helpModal.classList.remove('hidden');
    }

    // ==========================================================
    // INFORME FINAL Y DIAGNÓSTICO DE COMPETENCIAS
    // ==========================================================
    showFinalReport() {
        window.labAudio.playSuccess();
        const percentScore = Math.min(100, Math.round((this.score / this.maxPossibleScore) * 100));

        let rankTitle = 'Investigador/a Citogenético/a Senior';
        let rankColor = '#10b981';
        let rankDesc = 'Has demostrado un dominio riguroso y conceptual de los mecanismos de división celular.';

        if (percentScore < 60) {
            rankTitle = 'Técnico/a de Laboratorio en Formación';
            rankColor = '#f59e0b';
            rankDesc = 'Comprendes las fases generales, pero requieres reforzar la distinción entre cromosomas homólogos y cromátidas hermanas.';
        } else if (percentScore < 85) {
            rankTitle = 'Científico/a Biomédico/a Titular';
            rankColor = '#38bdf8';
            rankDesc = 'Excelente desempeño. Tus predicciones y análisis forenses reflejan una sólida base en ciclo celular y meiosis.';
        }

        let compHtml = Object.keys(this.competencies).map(key => {
            const comp = this.competencies[key];
            const compRate = comp.total > 0 ? Math.round((comp.passed / comp.total) * 100) : 100;
            return `
                <div class="competency-card">
                    <div class="comp-header">
                        <span class="comp-title">${comp.name}</span>
                        <span class="comp-rate" style="color: ${compRate >= 75 ? '#34d399' : '#fbbf24'}">${compRate}% Dominio</span>
                    </div>
                    <div class="comp-bar-bg">
                        <div class="comp-bar-fill" style="width: ${compRate}%; background: ${compRate >= 75 ? '#10b981' : '#f59e0b'}"></div>
                    </div>
                    ${comp.reviews.length > 0 ? `
                        <div class="review-tips">
                            <strong>💡 Concepto clave a repasar:</strong>
                            <p>${comp.reviews[0]}</p>
                        </div>
                    ` : '<div class="review-perfect">✔ Competencia dominada sin anomalías conceptuales.</div>'}
                </div>
            `;
        }).join('');

        this.dom.reportContainer.innerHTML = `
            <div class="report-box">
                <div class="report-header">
                    <div class="report-badge">CERTIFICACIÓN ACADÉMICA CITOLAB</div>
                    <h1 class="report-title">Informe Forense y Evaluación de Competencias</h1>
                    <div class="rank-badge" style="background: ${rankColor}22; border: 1.5px solid ${rankColor}; color: ${rankColor}">
                        ${rankTitle}
                    </div>
                    <p class="rank-description">${rankDesc}</p>
                </div>

                <div class="score-summary-grid">
                    <div class="summary-metric">
                        <span class="metric-num">${this.score}</span>
                        <span class="metric-label">Puntuación de Rigor Científico</span>
                    </div>
                    <div class="summary-metric">
                        <span class="metric-num">${percentScore}%</span>
                        <span class="metric-label">Eficacia Global de Diagnóstico</span>
                    </div>
                    <div class="summary-metric">
                        <span class="metric-num">2n = 4</span>
                        <span class="metric-label">Modelo Celular Resuelto</span>
                    </div>
                </div>

                <div class="competencies-block">
                    <h3>Desglose de Competencias Curriculares (4.º ESO):</h3>
                    ${compHtml}
                </div>

                <div class="report-actions">
                    <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir / Guardar Informe PDF</button>
                    <button class="btn btn-secondary" onclick="location.reload()">🔄 Reiniciar Misión Científica</button>
                </div>
            </div>
        `;

        this.dom.finalReportModal.classList.remove('hidden');
    }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CitoLabApp();
    window.app.init();
});
