class Grafico {
    constructor(id, chegada, fim) {
        this.Id = id;
        this.Chegada = chegada;
        this.Fim = fim;
    }
}

class Processo {
    constructor(id, tempoChegada, tempoRestante, prioridade, tempoConclusao, tempoInversao, tempoEspera) {
        this.id = id;
        this.tempoChegada = tempoChegada;
        this.tempoRestante = tempoRestante;
        this.prioridade = prioridade;
        this.TempoConclusao = tempoConclusao;
        this.TempoInversao = tempoInversao;
        this.TempoEspera = tempoEspera;
    }
}

function criarLinhasTabela(quantidade) {
    let tabela = document.getElementById("tabela").getElementsByTagName('tbody')[0];
    tabela.innerHTML = "";
    for (let i = 0; i < quantidade; i++) {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${i + 1}</td><td contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td>`;
        tabela.appendChild(tr);
    }
}

function obterDadosProcessos() {
    let processos = [];
    let linhas = document.querySelectorAll("#tabela tbody tr");
    let algoritmo = document.getElementById("algoritmo").value;

    for (let i = 0; i < linhas.length; i++) {
        let colunas = linhas[i].querySelectorAll("td");
        let tempoChegada = parseInt(colunas[1].innerText);
        let tempoRestante = parseInt(colunas[2].innerText);
        let prioridade = parseInt(colunas[3].innerText);

        if (algoritmo == "RR" || algoritmo == "SRTF" || algoritmo == "FCFS" || algoritmo == "SJF") {
            if (isNaN(tempoChegada) || isNaN(tempoRestante)) {
                Swal.fire({
                    title: 'Preencha a Tabela!',
                    text: 'Preencha todos os valores na tabela antes de executar o algoritmo.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500
                });
                return [];
            }
        }
        if (algoritmo == "PRIOC" || algoritmo == "PRIOP") {
            if (isNaN(tempoChegada) || isNaN(tempoRestante) || isNaN(prioridade)) {
                Swal.fire({
                    title: 'Preencha a Tabela!',
                    text: 'Preencha todos os valores na tabela antes de executar o algoritmo.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500
                });
                return [];
            }
        }

        processos.push(new Processo(i, tempoChegada, tempoRestante, prioridade));
    }
    return processos;
}

function executarAlgoritmo() {

    let algoritmo = document.getElementById("algoritmo").value;
    let processos = obterDadosProcessos();

    document.getElementById("salvar").style.display = "block";


    let resultados;
    switch (algoritmo) {
        case "FCFS":
            CalcularFCFS(processos);
            break;
        case "SJF":
            resultados = CalcularSJF(processos);
            break;
        case "PRIOC":
            resultados = CalcularPRIOc(processos);
            break;
        case "PRIOP":
            resultados = CalcularPRIOp(processos);
            break;
        case "SRTF":
            resultados = CalcularSRTF(processos);
            break;
        case "RR":
            const mostrarPrompt = async () => {
                let numeroInserido = '';
                let isValid = false;

                while (!isValid) {
                    await Swal.fire({
                        title: 'Digite um número:',
                        input: 'text',
                        inputAttributes: {
                            autocapitalize: 'off'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancelar',
                        showLoaderOnConfirm: true,
                        preConfirm: (value) => {
                            if (!isNaN(parseFloat(value))) {
                                numeroInserido = parseFloat(value);
                                isValid = true;
                            } else {
                                Swal.showValidationMessage('Por favor, insira um número válido!');
                            }
                        },
                        allowOutsideClick: () => !Swal.isLoading()
                    });
                }

                // Aqui você pode fazer o que precisa com o número inserido
                let quantum = numeroInserido;
                CalcularRR(processos, quantum);
            };

            mostrarPrompt();


            break;
        default:
            alert("Opção inválida!");
    }

    if (algoritmo == "SJF" || algoritmo == "PRIOC") {

        let tempoMedioExecucaoSpan = document.getElementById("tempo-medio-execucao");
        let tempoMedioEsperaSpan = document.getElementById("tempo-medio-espera");
        let tempoMedioExecucao = resultados.reduce((acc, curr) => acc + (curr.tempoConclusao - curr.tempoChegada), 0) / processos.length;
        let tempoMedioEspera = resultados.reduce((acc, curr) => acc + ((curr.tempoConclusao - curr.tempoChegada) - curr.tempoRestante), 0) / processos.length;
        tempoMedioExecucaoSpan.textContent = tempoMedioExecucao.toFixed(2);
        tempoMedioEsperaSpan.textContent = tempoMedioEspera.toFixed(2);
    }
    limparValoresNegativos();
}

let chartInstance;

function criarGrafico(dadosGrafico) {
    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('grafico').getContext('2d');
    const barData = [];
    const cores = ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(255, 99, 132, 0.5)'];

    dadosGrafico.forEach((dado, index) => {
        barData.push({
            label: `P${dado.id}`,
            backgroundColor: cores[index % cores.length],
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            data: [{ x: `P${dado.id}`, y: dado.chegada }, { x: `P${dado.id}`, y: dado.termino }]
        });
    });

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: barData
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Gráfico de Tempo de Chegada e Término'
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Processos'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Tempo'
                    },
                    suggestedMin: 0
                }
            },
            elements: {
                bar: {
                    barPercentage: 0
                }
            }
        }
    });
}

function CalcularFCFS(processos) {
    let tempoDeTermino = [];
    let tempoFinal = 0;
    let tempoDeExecucao = 0;
    let tempoMedioDeExecucao = 0;
    let tempoMedioDeEspera = 0;
    let count = 0;
    let dadosGrafico = [];

    processos.sort((a, b) => a.tempoChegada - b.tempoChegada || a.id - b.id);

    processos.forEach(processo => {
        tempoFinal += processo.tempoRestante;
        tempoDeExecucao += tempoFinal - processo.tempoChegada;
        tempoDeTermino.push({ id: processo.id, tempo: tempoFinal });

        dadosGrafico.push({ id: processo.id + 1, chegada: processo.tempoChegada, termino: tempoFinal });

        count++;
    });

    tempoMedioDeExecucao = tempoDeExecucao / processos.length;
    tempoMedioDeEspera = (tempoDeExecucao - tempoFinal) / processos.length;

    document.getElementById("tempo-medio-execucao").textContent = tempoMedioDeExecucao.toFixed(2);
    document.getElementById("tempo-medio-espera").textContent = tempoMedioDeEspera.toFixed(2);

    criarGrafico(dadosGrafico);
}

function CalcularSJF(processos) {
    let tempoTotal = 0;
    let tempoEsperaTotal = 0;
    let processosOrdenados = processos.slice().sort((a, b) => a.tempoChegada - b.tempoChegada);
    let fila = [];
    let tempoAtual = 0;
    let resultados = [];
    let dadosGrafico = [];

    while (processosOrdenados.length > 0 || fila.length > 0) {
        while (processosOrdenados.length > 0 && processosOrdenados[0].tempoChegada <= tempoAtual) {
            let processo = processosOrdenados.shift();
            fila.push(processo);
            fila.sort((a, b) => a.tempoRestante - b.tempoRestante);
        }
        if (fila.length > 0) {
            let processoAtual = fila.shift();
            processoAtual.tempoInicioExecucao = tempoAtual;
            tempoAtual += processoAtual.tempoRestante;
            processoAtual.tempoConclusao = tempoAtual;
            tempoTotal += processoAtual.tempoConclusao - processoAtual.tempoChegada;
            tempoEsperaTotal += processoAtual.tempoInicioExecucao - processoAtual.tempoChegada;
            dadosGrafico.push({ id: processoAtual.id + 1, chegada: processoAtual.tempoChegada, termino: processoAtual.tempoConclusao });
            resultados.push(processoAtual);
        } else {
            tempoAtual = processosOrdenados[0].tempoChegada;
        }
    }

    let tempoMedioEspera = tempoEsperaTotal / processos.length;
    let tempoMedioExecucao = tempoTotal / processos.length;

    let tempoMedioExecucaoSpan = document.getElementById("tempo-medio-execucao");
    let tempoMedioEsperaSpan = document.getElementById("tempo-medio-espera");
    tempoMedioExecucaoSpan.textContent = tempoMedioExecucao.toFixed(2);
    tempoMedioEsperaSpan.textContent = tempoMedioEspera.toFixed(2);

    criarGrafico(dadosGrafico);

    return resultados;
}

function CalcularPRIOc(processos) {
    let tempoTotal = 0;
    let tempoEsperaTotal = 0;
    let processosOrdenados = processos.slice().sort((a, b) => a.tempoChegada - b.tempoChegada);
    let fila = [];
    let tempoAtual = 0;
    let resultados = [];
    let dadosGrafico = [];
    while (processosOrdenados.length > 0 || fila.length > 0) {
        while (processosOrdenados.length > 0 && processosOrdenados[0].tempoChegada <= tempoAtual) {
            let processo = processosOrdenados.shift();
            fila.push(processo);
        }
        if (fila.length > 0) {
            let processoAtual = fila.reduce((a, b) => a.prioridade > b.prioridade ? a : b);
            fila.splice(fila.indexOf(processoAtual), 1);
            processoAtual.tempoInicioExecucao = tempoAtual;
            tempoAtual += processoAtual.tempoRestante;
            processoAtual.tempoConclusao = tempoAtual;
            tempoTotal += processoAtual.tempoConclusao - processoAtual.tempoChegada;
            tempoEsperaTotal += processoAtual.tempoInicioExecucao - processoAtual.tempoChegada;
            dadosGrafico.push({ id: processoAtual.id + 1, chegada: processoAtual.tempoChegada, termino: processoAtual.tempoConclusao });
            resultados.push(processoAtual);
        } else {
            tempoAtual = processosOrdenados[0].tempoChegada;
        }
    }
    let tempoMedioEspera = tempoEsperaTotal / processos.length;
    let tempoMedioExecucao = tempoTotal / processos.length;
    criarGrafico(dadosGrafico);

    return resultados;
}

function CalcularPRIOp(processos) {
    let tempoTotal = 0;
    let tempoEsperaTotal = 0;
    let processosOrdenados = processos.slice().sort((a, b) => a.tempoChegada - b.tempoChegada);
    let fila = [];
    let tempoAtual = 0;
    let resultados = [];
    let dadosGrafico = [];
    while (processosOrdenados.length > 0 || fila.length > 0) {
        while (processosOrdenados.length > 0 && processosOrdenados[0].tempoChegada <= tempoAtual) {
            let processo = processosOrdenados.shift();
            fila.push(processo);
        }

        if (fila.length > 0) {
            let processoAtual = fila.sort((a, b) => b.prioridade - a.prioridade)[0];
            fila = fila.filter(p => p !== processoAtual);
            processoAtual.tempoInicioExecucao = tempoAtual;

            if (processoAtual.tempoRestante > 1) {
                processoAtual.tempoRestante--;
                tempoAtual++;
                fila.push(processoAtual);
                fila.sort((a, b) => b.prioridade - a.prioridade);
            } else {
                tempoAtual++;
                processoAtual.tempoConclusao = tempoAtual;
                tempoTotal += processoAtual.tempoConclusao - processoAtual.tempoChegada;
                tempoEsperaTotal += processoAtual.tempoInicioExecucao - processoAtual.tempoChegada;

                dadosGrafico.push({ id: processoAtual.id + 1, chegada: processoAtual.tempoChegada, termino: processoAtual.tempoConclusao });
                resultados.push(processoAtual);
            }
        } else {
            tempoAtual = processosOrdenados[0].tempoChegada;
        }

        let processoMenorTempoRestante = fila.find(p => p.tempoRestante < fila[0].tempoRestante);
        if (processoMenorTempoRestante) {
            fila = fila.filter(p => p !== processoMenorTempoRestante);
            fila.push(processoMenorTempoRestante);
        }
    }

    let tempoMedioEspera = (tempoTotal - tempoAtual) / processos.length;
    let tempoMedioExecucao = tempoTotal / processos.length;

    document.getElementById("tempo-medio-execucao").textContent = tempoMedioExecucao.toFixed(2);
    document.getElementById("tempo-medio-espera").textContent = tempoMedioEspera.toFixed(2);
    criarGrafico(dadosGrafico);

    return resultados;
}

function CalcularSRTF(processos) {
    let tempoTotal = 0;
    let tempoEsperaTotal = 0;
    let processosOrdenados = processos.slice().sort((a, b) => a.tempoChegada - b.tempoChegada);
    let fila = [];
    let tempoAtual = 0;
    let resultados = [];
    let dadosGrafico = [];
    while (processosOrdenados.length > 0 || fila.length > 0) {
        while (processosOrdenados.length > 0 && processosOrdenados[0].tempoChegada <= tempoAtual) {
            let processo = processosOrdenados.shift();
            fila.push(processo);
            fila.sort((a, b) => a.tempoRestante - b.tempoRestante);
        }
        if (fila.length > 0) {
            let processoAtual = fila[0];
            fila.splice(0, 1);
            processoAtual.tempoInicioExecucao = tempoAtual;
            for (let processo of fila) {
                if (processo.tempoChegada <= tempoAtual && processo.tempoRestante < processoAtual.tempoRestante) {
                    fila.shift();
                    fila.push(processoAtual);
                    processoAtual = processo;
                }
            }
            tempoAtual += 1;
            processoAtual.tempoRestante -= 1;
            if (processoAtual.tempoRestante === 0) {
                processoAtual.tempoConclusao = tempoAtual;
                tempoTotal += processoAtual.tempoConclusao - processoAtual.tempoChegada;
                tempoEsperaTotal += processoAtual.tempoInicioExecucao - processoAtual.tempoChegada;
                dadosGrafico.push({ id: processoAtual.id + 1, chegada: processoAtual.tempoChegada, termino: processoAtual.tempoConclusao });
                resultados.push(processoAtual);
            } else {
                fila.push(processoAtual);
                fila.sort((a, b) => a.tempoRestante - b.tempoRestante);
            }
        } else {
            tempoAtual = processosOrdenados[0].tempoChegada;
        }
    }

    let tempoMedioExecucao = tempoTotal / processos.length;
    let tempoMedioEspera = (tempoTotal - tempoAtual) / processos.length;
    let tempoMedioExecucaoSpan = document.getElementById("tempo-medio-execucao");
    let tempoMedioEsperaSpan = document.getElementById("tempo-medio-espera");
    tempoMedioExecucaoSpan.textContent = tempoMedioExecucao.toFixed(2);
    tempoMedioEsperaSpan.textContent = tempoMedioEspera.toFixed(2);
    criarGrafico(dadosGrafico);

    return resultados;
}
class ProcessoTermino {
    constructor(id, tempoTermino) {
        this.id = id;
        this.tempoTermino = tempoTermino;
    }
}

function CalcularRR(processos, quantumTempo) {
    let tempoTerminoPorId = {};
    let informacoesProcessos = [...processos];
    let dadosGrafico = [];
    let filaPronta = [];
    let tempoAtual = informacoesProcessos[0].tempoChegada;
    let trabalhosInacabados = [...informacoesProcessos];
    let tempoRestante = {};
    let somaTempoChegada = 0.00;
    let somaTempoRestante = 0.00;
    var somaTempoTermino = 0;

    informacoesProcessos.forEach(p => {
        tempoRestante[p.id] = p.tempoRestante;
    });

    filaPronta.push(trabalhosInacabados[0]);
    while (Object.values(tempoRestante).reduce((acc, curr) => acc + curr, 0) > 0 && trabalhosInacabados.length > 0) {
        if (filaPronta.length === 0 && trabalhosInacabados.length > 0) {
            filaPronta.push(trabalhosInacabados[0]);
            tempoAtual = filaPronta[0].tempoChegada;
        }

        let processoParaExecutar = filaPronta[0];

        let tempoRest = Math.min(tempoRestante[processoParaExecutar.id], quantumTempo);
        tempoRestante[processoParaExecutar.id] -= tempoRest;
        let tempoAtualAnterior = tempoAtual;
        tempoAtual += tempoRest;
        dadosGrafico.push({ id: processoParaExecutar.id + 1, chegada: tempoAtualAnterior, termino: tempoAtual });

        let processosParaChegarNesteCiclo = informacoesProcessos
            .filter(p => p.tempoChegada <= tempoAtual && p !== processoParaExecutar && !filaPronta.includes(p) && trabalhosInacabados.includes(p));

        filaPronta.push(...processosParaChegarNesteCiclo);

        filaPronta.push(filaPronta[0]);
        filaPronta.shift();

        if (tempoRestante[processoParaExecutar.id] === 0) {
            let indiceParaRemoverTI = trabalhosInacabados.findIndex(p => p.id === processoParaExecutar.id);
            if (indiceParaRemoverTI > -1) {
                trabalhosInacabados.splice(indiceParaRemoverTI, 1);
                tempoTerminoPorId[processoParaExecutar.id] = tempoAtual;
            }

            let indiceParaRemoverFP = filaPronta.findIndex(p => p.id === processoParaExecutar.id);
            if (indiceParaRemoverFP > -1)
                filaPronta.splice(indiceParaRemoverFP, 1);

        }
    }

    processos.forEach(processo => {
        somaTempoChegada += processo.tempoChegada;
        somaTempoRestante += processo.tempoRestante;
    });

    Object.keys(tempoTerminoPorId).forEach(id => {
        somaTempoTermino += tempoTerminoPorId[id];
    });

    tempoMedioExecucao = ((somaTempoTermino - somaTempoChegada) / processos.length);
    tempoMedioEspera = (((somaTempoTermino - somaTempoChegada) - somaTempoRestante) / processos.length);
    document.getElementById("tempo-medio-execucao").innerText = tempoMedioExecucao.toFixed(2);
    document.getElementById("tempo-medio-espera").innerText = tempoMedioEspera.toFixed(2);
    criarGrafico(dadosGrafico);
}

document.getElementById("quantidade").addEventListener("change", function () {
    let quantidade = parseInt(this.value);
    criarLinhasTabela(quantidade);
});

criarLinhasTabela(5);

function preencherTabelaComExcelData(worksheet) {


    const headerRow = worksheet[0];
    const tempoChegadaIndex = headerRow.indexOf('Tempo Chegada');
    const tempoRestanteIndex = headerRow.indexOf('Tempo Restante');
    const prioridadeIndex = headerRow.indexOf('Prioridade');

    if (tempoChegadaIndex === -1 || tempoRestanteIndex === -1 || prioridadeIndex === -1) {
        console.error('Colunas necessárias não encontradas no arquivo Excel.');
        return;
    }

    const tabela = document.getElementById('tabela').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';

    for (let i = 1; i < worksheet.length; i++) {
        const rowData = worksheet[i];
        const tempoChegada = rowData[tempoChegadaIndex];
        const tempoRestante = rowData[tempoRestanteIndex];
        const prioridade = rowData[prioridadeIndex];

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i}</td><td contenteditable="true">${tempoChegada}</td><td contenteditable="true">${tempoRestante}</td><td contenteditable="true">${prioridade}</td>`;
        tabela.appendChild(tr);
    }
}

document.getElementById('excelFile').addEventListener('change', function (event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const reader = new FileReader();

    fileInput.value = '';

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        preencherTabelaComExcelData(XLSX.utils.sheet_to_json(worksheet, { header: 1 }));
    };

    reader.readAsArrayBuffer(file);
});

function limparValoresNegativos() {
    document.querySelectorAll("#tabela tbody td").forEach(cell => {
        if (parseInt(cell.textContent) < 0) {
            cell.textContent = 0;
        }
    });

    const tempoMedioExecucaoSpan = document.getElementById("tempo-medio-execucao");
    const tempoMedioEsperaSpan = document.getElementById("tempo-medio-espera");
    const tempoMedioExecucao = parseFloat(tempoMedioExecucaoSpan.textContent);
    const tempoMedioEspera = parseFloat(tempoMedioEsperaSpan.textContent);

    if (tempoMedioExecucao < 0) {
        tempoMedioExecucaoSpan.textContent = 0;
    }
    if (tempoMedioEspera < 0) {
        tempoMedioEsperaSpan.textContent = 0;
    }
}

function salvarGrafico() {
    var grafico = document.getElementById("grafico");
    var url = grafico.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = 'grafico.png';
    link.href = url;
    link.click();
}

