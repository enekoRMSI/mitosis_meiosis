/**
 * CitoLab Mission Database & Educational Mechanics
 * Diseñado específicamente para 4.º de ESO con rigor biológico absoluto.
 * Opciones y justificaciones equilibradas en extensión y dificultad.
 * Múltiples mecánicas de pulsar, arrastrar y manipular cromosomas.
 */

const MissionsData = [
    // ==========================================
    // FASE 0: EL REACTOR DEL CICLO CELULAR (INTERFASE)
    // ==========================================
    {
        id: 'phase_0',
        badge: 'Módulo 0',
        divisionType: 'mitosis',
        title: 'El Ciclo Celular: Replicación y Cromatina',
        subtitle: 'Diagnóstico del reactor nuclear antes de la división',
        description: 'Una célula somática diploide modelo (2n = 4) se prepara en interfase. Contiene 2 pares de cromosomas homólogos (un par largo y un par corto). Debes preparar el material genético para la división.',
        competencyKey: 'cycle_and_replication',
        initialScore: 200,
        steps: [
            {
                type: 'predict_and_reason',
                instruction: 'Analiza el estado de la célula en la fase G1 de la interfase y predice qué ocurrirá tras la fase S (Síntesis de ADN).',
                visualState: 'interphase_g1',
                question: 'En fase G1, la célula modelo tiene 4 cromosomas simples (4 moléculas de ADN). ¿Cuál será la dotación cromosómica exacta al entrar en G2 tras completar la fase S?',
                options: [
                    { id: 'a', text: '8 cromosomas simples independientes distribuidos en dos núcleos en interfase (8 moléculas de ADN).' },
                    { id: 'b', text: '4 cromosomas duplicados, formados por 8 cromátidas hermanas en total (8 moléculas de ADN).' },
                    { id: 'c', text: '2 cromosomas gigantes tetraploides unidos por centrómeros secundarios (4 moléculas de ADN).' },
                    { id: 'd', text: '4 cromosomas simples con replicación incompleta y envoltura nuclear reforzada (6 moléculas de ADN).' }
                ],
                correctOption: 'b',
                reasoningPrompt: '¿Cuál es la justificación biológica obligatoria?',
                reasoningOptions: [
                    { id: 'r1', text: 'Los cromosomas homólogos se condensan prematuramente fusionando sus brazos para incrementar la masa proteica nuclear.' },
                    { id: 'r2', text: 'La replicación del ADN rompe de inmediato los centrómeros originales originando cromosomas hijos libres e independientes.' },
                    { id: 'r3', text: 'La replicación duplica cada molécula de ADN formando una cromátida hermana idéntica, manteniéndose unidas por un único centrómero.' },
                    { id: 'r4', text: 'Únicamente los cromosomas de origen paterno completan la duplicación génica, mientras los maternos esperan a la metafase.' }
                ],
                correctReasoning: 'r3',
                hint1: 'Recuerda la regla de oro: se cuenta un cromosoma por cada centrómero funcional. Si dos copias están unidas por el centrómero, son "cromátidas hermanas" de un solo cromosoma.',
                hint2: 'En la fase S se duplica la masa de ADN (pasa de 2C a 4C), pero el número de cromosomas (2n = 4) sigue siendo el mismo porque están en forma de "X" (cromosomas dobles).'
            },
            {
                type: 'interactive_replication',
                instruction: 'Sintetiza las cromátidas hermanas. Haz clic en cada uno de los 4 filamentos de cromatina simple para activar la ADN polimerasa y convertirlos en cromosomas dobles replicados.',
                visualState: 'replication_interactive',
                targetReplications: 4,
                feedbackCompleted: '¡Replicación de ADN completada con éxito! Ahora disponemos de 4 cromosomas duplicados (8 cromátidas hermanas idénticas unidas por sus respectivos centrómeros).'
            }
        ]
    },

    // ==========================================
    // FASE 1: MISIÓN MITOSIS (REPARACIÓN TISULAR)
    // ==========================================
    {
        id: 'phase_1',
        badge: 'Módulo 1',
        divisionType: 'mitosis',
        title: 'Mitosis: Regeneración y Conservación Genética',
        subtitle: 'División ecuacional para células somáticas (2n = 4)',
        description: 'Un tejido epitelial ha sufrido daños. Para repararlo, la célula debe dividirse por mitosis generando 2 células hijas clónicas y genéticamente idénticas a la progenitora.',
        competencyKey: 'mitosis_mechanics',
        initialScore: 250,
        steps: [
            {
                type: 'order_phases',
                instruction: 'Ordena cronológicamente las fases de la mitosis para que el citoesqueleto proceda sin inducir aberraciones.',
                phases: [
                    { id: 'P', name: 'Profase', desc: 'Condensación de la cromatina en cromosomas visibles; la envoltura nuclear se desintegra; los centrosomas migran a polos opuestos.' },
                    { id: 'M', name: 'Metafase', desc: 'Los cromosomas alcanzan su máxima condensación y se alinean de forma individual e independiente en el plano ecuatorial.' },
                    { id: 'A', name: 'Anafase', desc: 'Ruptura enzimática de los centrómeros; las cromátidas hermanas se separan y migran a polos opuestos arrastradas por el huso.' },
                    { id: 'T', name: 'Telofase', desc: 'Los cromosomas simples llegan a los polos y se descondensan; reaparece la envoltura nuclear en cada polo; se inicia la citocinesis.' }
                ],
                correctOrder: ['P', 'M', 'A', 'T'],
                hint1: 'Piensa en la regla mnemotécnica clásica: "PROMETO a ANA TEJER" (Profase, Metafase, Anafase, Telofase).',
                hint2: 'Primero se condensan los cromosomas (P), luego se alinean en el centro (M), después se separan hacia los extremos (A) y finalmente se reconstruyen los núcleos (T).'
            },
            {
                type: 'interactive_metaphase_plate',
                instruction: 'Disposición cromosómica en Metafase Mitótica: Coloca los 4 cromosomas duplicados en la placa ecuatorial.',
                subInstruction: 'Arrastra o haz clic en los cromosomas del citoplasma para ubicarlos en sus 4 anclajes cinetocóricos en el ecuador.',
                visualState: 'mitosis_metaphase_drag',
                requiredItems: 4,
                checkExplanation: 'En la mitosis, los 4 cromosomas se colocan en fila india (uno a uno) en la placa metafásica. Las dos cromátidas hermanas de cada cromosoma miran a polos opuestos.'
            },
            {
                type: 'interactive_mitosis_anaphase_drag',
                instruction: 'Anafase Mitótica Interactiva: Separa las cromátidas hermanas hacia los polos celulares.',
                subInstruction: 'Arrastra o pulsa en las cromátidas hermanas para dirigir exactamente 4 cromátidas al Polo Izquierdo y 4 al Polo Derecho.',
                visualState: 'mitosis_anaphase_view',
                checkExplanation: 'Al separar las cromátidas hermanas, cada polo recibe 4 cromátidas individuales (4 cromosomas simples), garantizando que las dos células hijas sean diploides (2n = 4).'
            },
            {
                type: 'predict_and_reason',
                instruction: 'Balance Genético Final de la Mitosis',
                visualState: 'mitosis_anaphase_view',
                question: 'En la anafase mitótica, ¿qué elementos biológicos son separados hacia los polos por las fibras del huso cinetocórico?',
                options: [
                    { id: 'a', text: 'Las parejas de cromosomas homólogos completos con sus dos cromátidas aún unidas.' },
                    { id: 'b', text: 'Los centrómeros desprovistos de material genético tras degradarse las cromátidas.' },
                    { id: 'c', text: 'Las cromátidas hermanas idénticas que constituían cada cromosoma duplicado.' },
                    { id: 'd', text: 'Únicamente los cromosomas de origen materno, migrando los paternos a vacuolas.' }
                ],
                correctOption: 'c',
                reasoningPrompt: '¿Qué garantiza este tipo de separación al finalizar la telofase y citocinesis?',
                reasoningOptions: [
                    { id: 'r1', text: 'Que se reduzca la dotación celular a la mitad (n = 2) para permitir la futura fecundación somática del tejido.' },
                    { id: 'r2', text: 'Que cada célula hija reciba una copia exacta de cada cromátida hermana, conservando la condición diploide (2n = 4).' },
                    { id: 'r3', text: 'Que se generen nuevas combinaciones alélicas por recombinación al azar durante la tracción de los microtúbulos.' },
                    { id: 'r4', text: 'Que una de las células hijas herede todos los cromosomas grandes y la otra los pequeños para dividirse el trabajo celular.' }
                ],
                correctReasoning: 'r2',
                hint1: 'Fíjate bien: la mitosis busca generar células idénticas para reparar tejidos corporales, no formar gametos reproductivos.',
                hint2: 'Si se separan las cromátidas hermanas que eran fotocopias exactas creadas en la fase S, cada célula hija se queda con la misma información original: 2n = 4.'
            }
        ]
    },

    // ==========================================
    // FASE 2: MISIÓN MEIOSIS I (REDUCCIÓN Y RECOMBINACIÓN)
    // ==========================================
    {
        id: 'phase_2',
        badge: 'Módulo 2',
        divisionType: 'meiosis',
        title: 'Meiosis I: Recombinación y División Reduccional',
        subtitle: 'La clave de la variabilidad genética y la formación de gametos',
        description: 'En las gónadas de un organismo, una célula germinal diploide (2n = 4) inicia la gametogénesis. Aquí ocurren los dos procesos biológicos que hacen que cada hijo sea genéticamente único.',
        competencyKey: 'meiosis_1_reduction',
        initialScore: 300,
        steps: [
            {
                type: 'synapsis_pairing',
                instruction: 'Profase I (Cigoteno y Paquiteno): Emparejamiento de Homólogos (Sinapsis) y Crossing-Over.',
                subInstruction: 'Arrastra o haz clic en los homólogos maternos para unirlos con sus respectivos homólogos paternos y formar los bivalentes (tétradas). Luego activa los quiasmas para recombinar.',
                visualState: 'crossing_over_simulation',
                educationalNote: '¡Atención al rigor!: El entrecruzamiento se produce exclusivamente entre cromátidas NO hermanas de cromosomas homólogos (materno y paterno), creando nuevas combinaciones alélicas (cromátidas recombinadas).'
            },
            {
                type: 'predict_and_reason',
                instruction: 'Compara la Metafase I de la Meiosis con la Metafase de la Mitosis.',
                visualState: 'meiosis_metaphase_1_plate',
                question: '¿Cómo se disponen los cromosomas en la placa ecuatorial durante la Metafase I de la meiosis en comparación con la mitosis?',
                options: [
                    { id: 'a', text: 'Alineados de forma individual e independiente en una sola fila india como en la mitosis tradicional.' },
                    { id: 'b', text: 'Desorganizados en la periferia nuclear sin interactuar con los microtúbulos del huso acromático.' },
                    { id: 'c', text: 'Fusionados por los telómeros en un anillo central único para sincronizar la degradación de envolturas.' },
                    { id: 'd', text: 'Emparejados en bivalentes o tétradas (parejas de homólogos frente a frente en el plano ecuatorial).' }
                ],
                correctOption: 'd',
                reasoningPrompt: '¿Qué consecuencia directa tiene esto en la Anafase I meiótica?',
                reasoningOptions: [
                    { id: 'r1', text: 'Se separan las cromátidas hermanas rompiendo todos los centrómeros de forma idéntica a la mitosis somática.' },
                    { id: 'r2', text: 'Ambos cromosomas homólogos se desplazan al mismo polo para duplicar la ploidía celular en el embrión.' },
                    { id: 'r3', text: 'Se interrumpe la síntesis de microtúbulos provocando la apoptosis inmediata de la célula germinal.' },
                    { id: 'r4', text: 'Se separan cromosomas homólogos completos con dos cromátidas, reduciendo la dotación de diploide (2n = 4) a haploide (n = 2).' }
                ],
                correctReasoning: 'r4',
                hint1: 'En meiosis I no se rompen centrómeros. Cada cromosoma del par homólogo viaja intacto (con sus dos cromátidas) a un polo diferente.',
                hint2: 'Por eso Meiosis I es llamada "división reduccional": las células hijas ya no tienen parejas de cromosomas, tienen solo un miembro de cada pareja (n = 2).'
            },
            {
                type: 'interactive_meiosis1_anaphase_drag',
                instruction: 'Anafase I Interactiva: Separación de Cromosomas Homólogos Completos.',
                subInstruction: 'Arrastra o pulsa en los cromosomas dobles para enviar un miembro de cada par homólogo al Polo Izquierdo y el otro al Polo Derecho.',
                visualState: 'meiosis_metaphase_1_plate',
                checkExplanation: '¡Observa la diferencia fundamental con la mitosis!: Aquí viajan cromosomas dobles enteros (con 2 cromátidas unidas). Cada polo recibe solo 2 cromosomas (1 grande y 1 pequeño), reduciendo la célula a haploide (n = 2).'
            },
            {
                type: 'interactive_segregation_check',
                instruction: 'Comprobación de Dotación al Final de Telofase I y Citocinesis I.',
                visualState: 'meiosis_1_products',
                question: 'Al concluir la primera división meiótica (Telofase I y Citocinesis I), ¿cuál es el estado cromosómico exacto de las 2 células resultantes?',
                options: [
                    { id: 'a', text: 'Son células haploides (n = 2), y cada uno de sus cromosomas se encuentra duplicado en dos cromátidas.' },
                    { id: 'b', text: 'Son células diploides completas (2n = 4) idénticas en masa génica y dotación a la célula inicial.' },
                    { id: 'c', text: 'Son células haploides (n = 2) formadas por cromosomas simples con una única molécula de ADN.' },
                    { id: 'd', text: 'Son células tetraploides transitorias (4n = 8) debido a la fusión de núcleos durante el telofase.' }
                ],
                correctOption: 'a',
                reasoningPrompt: '¿Por qué son haploides si todavía tienen 4 cromátidas en total cada una?',
                reasoningOptions: [
                    { id: 'r1', text: 'Porque la ploidía depende de los tipos de homólogos: tienen 1 grande y 1 pequeño (sin pareja), aunque conserven dos cromátidas.' },
                    { id: 'r2', text: 'Porque el volumen citoplasmático se reduce a la mitad forzando la degradación de la mitad de los genes nucleares.' },
                    { id: 'r3', text: 'Porque en realidad continúan siendo diploides hasta que se rompa la membrana plasmática en la segunda división.' },
                    { id: 'r4', text: 'Porque los centrómeros se duplican espontáneamente en el polo celular generando cromosomas supernumerarios.' }
                ],
                correctReasoning: 'r1',
                hint1: 'Fíjate en los tipos de cromosomas: en cada célula hija de Meiosis I hay solo UN cromosoma grande y UN cromosoma pequeño. No hay parejas homólogas.',
                hint2: 'Tener cromosomas dobles no significa ser diploide. Diploide significa tener cromosomas homólogos emparejados (uno paterno y uno materno para cada tamaño).'
            }
        ]
    },

    // ==========================================
    // FASE 3: MISIÓN MEIOSIS II (DIVISIÓN ECUACIONAL)
    // ==========================================
    {
        id: 'phase_3',
        badge: 'Módulo 3',
        divisionType: 'meiosis',
        title: 'Meiosis II: División Ecuacional y Gametos',
        subtitle: 'Separación de cromátidas y balance genético final',
        description: 'Las 2 células haploides intermedias entran en Meiosis II de forma casi inmediata, sin pasar por una interfase con replicación de ADN (no hay fase S intermedia).',
        competencyKey: 'meiosis_2_gametes',
        initialScore: 250,
        steps: [
            {
                type: 'predict_and_reason',
                instruction: 'Mecanismo de Meiosis II',
                visualState: 'meiosis_2_scheme',
                question: '¿Por qué la segunda división meiótica (Meiosis II) se describe como una división ecuacional similar a la mitosis?',
                options: [
                    { id: 'a', text: 'Porque transcurre en células somáticas diferenciadas tras una segunda interfase con duplicación del ADN celular.' },
                    { id: 'b', text: 'Porque en anafase II se separan cromátidas hermanas (recombinadas), pero partiendo de células que ya son haploides (n = 2).' },
                    { id: 'c', text: 'Porque los cromosomas homólogos vuelven a reunirse en pares antes de dividirse de nuevo en el ecuador.' },
                    { id: 'd', text: 'Porque las células resultantes restauran de forma autónoma la dotación diploide sin necesidad de fecundación.' }
                ],
                correctOption: 'b',
                reasoningPrompt: '¿Cuál es el resultado final absoluto de toda la meiosis completa para nuestra célula modelo (2n = 4)?',
                reasoningOptions: [
                    { id: 'r1', text: '2 células hijas diploides (2n = 4) idénticas a la célula progenitora y 2 corpúsculos polares degenerativos.' },
                    { id: 'r2', text: '4 células hijas diploides (2n = 4) con información genética clonada para la regeneración de tejidos gonadales.' },
                    { id: 'r3', text: '4 células hijas haploides (n = 2) con cromosomas simples, todas genéticamente distintas entre sí y distintas a la progenitora.' },
                    { id: 'r4', text: '1 único gameto con dotación 4n y 3 células accesorias carentes de núcleo y de orgánulos citoplasmáticos.' }
                ],
                correctReasoning: 'r3',
                hint1: 'Piensa en los gametos humanos (óvulos y espermatozoides): tienen la mitad de cromosomas (n) para que al unirse en la fecundación restauren el 2n.',
                hint2: 'Debido a la recombinación (crossing-over) y a la segregación aleatoria de homólogos, las 4 células hijas son genéticamente irrepetibles.'
            },
            {
                type: 'interactive_gamete_inspector',
                instruction: 'Inspección de Cariotipo de los 4 Gametos Resultantes.',
                subInstruction: 'Verifica la dotación de cada gameto generado. Haz clic en cada uno de los 4 gametos para certificar su dotación n = 2 (1 cromosoma largo + 1 cromosoma corto).',
                visualState: 'gametes_final_quad',
                targetInspections: 4,
                feedbackCompleted: '¡Certificación superada! Todos los gametos presentan n = 2 cromosomas simples con una combinación alélica única.'
            }
        ]
    },

    // ==========================================
    // FASE 4: EL DESAFÍO FORENSE DEL MICROSCOPIO (BOSS)
    // ==========================================
    {
        id: 'phase_4',
        badge: 'Módulo 4 (Reto Final)',
        divisionType: 'forensic',
        title: 'Laboratorio Forense de Diagnóstico Citológico',
        subtitle: 'Resolución de casos clínicos y detección de anomalías cromosómicas',
        description: 'Llegan al laboratorio tres muestras celulares no identificadas. Como científico/a titular, debes diagnosticar cada caso aplicando la totalidad de tus conocimientos.',
        competencyKey: 'cytological_diagnosis',
        initialScore: 400,
        steps: [
            {
                type: 'forensic_case_1',
                instruction: 'MUESTRA FORENSE ALFA: En el microscopio se observa una célula con sus cromosomas separándose hacia los polos opuestos. Hacia cada polo viajan 4 cromosomas simples de una sola cromátida.',
                visualState: 'forensic_sample_alpha',
                question: '¿Qué proceso y fase celular concreta estamos observando con certeza científica en la Muestra Alfa?',
                options: [
                    { id: 'a', text: 'Metafase I de la Meiosis, ya que los cromosomas se encuentran condensados cerca del centro celular.' },
                    { id: 'b', text: 'Anafase de la Mitosis, ya que se observa la migración simultánea de 4 cromátidas simples hacia cada uno de los dos polos.' },
                    { id: 'c', text: 'Anafase I de la Meiosis, puesto que las parejas de homólogos bivalentes están migrando en bloque a los polos.' },
                    { id: 'd', text: 'Anafase II de la Meiosis, porque únicamente están viajando dos cromátidas a cada polo celular respectivo.' }
                ],
                correctOption: 'b',
                reasoningPrompt: '¿Cuál es el argumento biomédico irrefutable?',
                reasoningOptions: [
                    { id: 'r1', text: 'Porque los cromosomas adquieren fluorescencia azul cobalto de forma exclusiva durante los procesos somáticos.' },
                    { id: 'r2', text: 'Porque la presencia de la envoltura nuclear íntegra solo es compatible con las etapas intermedias de la anafase.' },
                    { id: 'r3', text: 'Hacia cada polo viajan 4 cromátidas simples (futuros cromosomas), lo que garantizará dotaciones hijas 2n = 4 (en Meiosis I viajarían 2 dobles y en Meiosis II solo 2 simples).' },
                    { id: 'r4', text: 'Porque es la única fase de la división celular donde intervienen centriolos y microtúbulos polares activos.' }
                ],
                correctReasoning: 'r3',
                hint1: 'Cuenta cuántos elementos van a cada polo: 4. Si nuestra célula modelo es 2n = 4, ¿en qué división van 4 cromosomas a cada extremo?',
                hint2: 'En Meiosis I irían 2 cromosomas dobles a cada polo. En Meiosis II irían 2 cromátidas simples a cada polo. ¡Solo en Mitosis van 4 cromátidas a cada polo!'
            },
            {
                type: 'forensic_case_2',
                instruction: 'MUESTRA FORENSE BETA (Anomalía Genética): Se observa un fallo en la división meiótica de una célula (2n = 4). Un par de cromosomas homólogos no se separó en Anafase I (No-Disyunción).',
                visualState: 'forensic_sample_nondisjunction',
                question: 'En la Muestra Beta se produjo una no-disyunción meiótica en Meiosis I del Par 1. ¿Cuál será la dotación cromosómica de los gametos resultantes al concluir la meiosis completa?',
                options: [
                    { id: 'a', text: 'Los 4 gametos mantendrán la dotación normal n = 2 gracias a los mecanismos enzimáticos de corrección de Meiosis II.' },
                    { id: 'b', text: 'Dos gametos tendrán dotación 2n = 4 completa y los otros dos gametos quedarán totalmente desprovistos de material cromosómico (0).' },
                    { id: 'c', text: 'Todos los gametos sufrirán lisis celular inmediata sin llegar a formarse en el epitelio germinal del organismo.' },
                    { id: 'd', text: 'Dos gametos tendrán n + 1 = 3 cromosomas y dos gametos tendrán n - 1 = 1 cromosoma (aneuploidías meióticas).' }
                ],
                correctOption: 'd',
                reasoningPrompt: '¿Qué consecuencia biomédica tendría la fecundación de uno de esos gametos con n = 3 por un gameto normal (n = 2)?',
                reasoningOptions: [
                    { id: 'r1', text: 'La fecundación del gameto con n = 3 por un gameto normal (n = 2) formará un cigoto con 2n + 1 = 5 cromosomas (trisomía, homóloga al síndrome de Down).' },
                    { id: 'r2', text: 'El gameto con n = 3 originará un individuo perfectamente sano al tratarse de una duplicación beneficiosa sin desbalance génico.' },
                    { id: 'r3', text: 'El cigoto resultante se convertirá de forma inmediata en una estructura procariota carente de compartimentación nuclear.' },
                    { id: 'r4', text: 'Los cromosomas supernumerarios se expulsarán espontáneamente mediante vesículas de exocitosis durante la fecundación.' }
                ],
                correctReasoning: 'r1',
                hint1: 'Si no se separan los homólogos del Par 1, un polo recibe 2 cromosomas grandes + 1 pequeño (3 en total), y el otro solo 1 pequeño (1 en total).',
                hint2: 'En humanos, una no-disyunción en el cromosoma 21 origina gametos con 24 cromosomas en lugar de 23, originando una trisomía 21 al fecundarse.'
            },
            {
                type: 'interactive_forensic_sorter',
                instruction: 'CLASIFICADOR FORENSE: Arrastra las 3 muestras a sus bandejas de diagnóstico citológico correspondientes.',
                samples: [
                    { id: 's1', label: 'Muestra A: Célula con 4 cromátidas simples migrando a cada polo.', target: 'mitosis', title: 'Muestra Tisular A' },
                    { id: 's2', label: 'Muestra B: Célula con cromosomas homólogos duplicados separándose.', target: 'meiosis1', title: 'Muestra Germinal B' },
                    { id: 's3', label: 'Muestra C: Célula con dotaciones hijas de 3 cromosomas y 1 cromosoma.', target: 'aneuploidy', title: 'Muestra Patológica C' }
                ],
                trays: [
                    { id: 'mitosis', name: 'Mitosis Somática', desc: 'Conservación 2n = 4' },
                    { id: 'meiosis1', name: 'Meiosis I Reduccional', desc: 'Separación de Homólogos' },
                    { id: 'aneuploidy', name: 'No-Disyunción / Aneuploidía', desc: 'Anomalía Cromosómica' }
                ],
                feedbackCompleted: '¡Clasificación forense perfecta! Has identificado con rigor la mitosis, la meiosis y las aberraciones por no-disyunción.'
            },
            {
                type: 'matrix_comparison',
                instruction: 'MATRIZ INTEGRADA: Cuadro Comparativo Mitosis vs. Meiosis. Completa la correspondencia correcta de los parámetros celulares.',
                pairs: [
                    { param: 'Tipo de células diana', mitosis: 'Células somáticas (cuerpo)', meiosis: 'Línea germinal (gónadas)' },
                    { param: 'Número de divisiones nucleares', mitosis: '1 división', meiosis: '2 divisiones consecutivas' },
                    { param: 'Entrecruzamiento / Recombinación', mitosis: 'No se produce', meiosis: 'Sí (Profase I)' },
                    { param: 'Ploidía de las células resultantes', mitosis: 'Diploide (2n = 4)', meiosis: 'Haploide (n = 2)' },
                    { param: 'Objetivo biológico fundamental', mitosis: 'Crecimiento y regeneración tisular', meiosis: 'Variabilidad genética y reproducción sexual' }
                ],
                question: '¿Cuál de las siguientes afirmaciones sobre la comparación entre Mitosis y Meiosis es RIGUROSAMENTE CIERTA?',
                options: [
                    { id: 'a', text: 'En la mitosis se forman tétradas bivalentes en el plano ecuatorial con el fin de duplicar la tasa de reparación tisular.' },
                    { id: 'b', text: 'En la meiosis se produce una sola división nuclear precedida de dos ciclos consecutivos de síntesis de ADN cromatínico.' },
                    { id: 'c', text: 'La mitosis preserva fielmente el genotipo diploide (2n → 2n) para crecimiento o reparación, mientras que la meiosis genera cuatro células haploides únicas (2n → 4 células n) favoreciendo la variabilidad genética.' },
                    { id: 'd', text: 'La meiosis da lugar a gametos clónicos e idénticos a la célula progenitora para asegurar la continuidad de la especie.' }
                ],
                correctOption: 'c',
                reasoningPrompt: 'Confirma tu razonamiento científico global:',
                reasoningOptions: [
                    { id: 'r1', text: 'He memorizado exclusivamente las siglas de las fases sin relacionarlas con el comportamiento de las cromátidas.' },
                    { id: 'r2', text: 'La mitosis y la meiosis cumplen la misma función biológica en todos los tejidos de los organismos pluricelulares.' },
                    { id: 'r3', text: 'El intercambio de material genético únicamente tiene lugar entre cromosomas no homólogos de distinto tamaño.' },
                    { id: 'r4', text: 'He asimilado con rigor que la mitosis genera clones somáticos diploides y la meiosis células haploides diversas para la reproducción sexual.' }
                ],
                correctReasoning: 'r4',
                hint1: 'Revisa el propósito: reparar tejidos (mitosis) vs tener descendencia diversa (meiosis).',
                hint2: 'La opción correcta debe sintetizar la ploidía (2n vs n), el número de células (2 vs 4) y la variabilidad genética.'
            }
        ]
    }
];

window.MissionsData = MissionsData;
