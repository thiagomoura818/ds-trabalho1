class Alerta{
	constructor(id_produto, valor_produto, tipo_acao, valido){
		this.id_produto = id_produto;
		this.valor_produto = valor_produto;
		this.tipo_acao = tipo_acao;
		this.valido = valido;
	}
}

class Compra{
	constructor(id_produto, descricao_produto, valor_compra){
		this.id_produto = id_produto;
		this.descricao_produto = descricao_produto;
		this.valor_compra = valor_compra;
	}
}

$(document).ready(function() {
	$("#formulario").on("submit", autenticar);
});

$("#formulario").validate(
	{
		rules:{
			login:{
				required: true
			},
			senha:{
				required: true
			}
		},
		messages:{
			login:{
				required: "Campo obrigatório",
			},
			senha:{
				required: "Campo obrigatório"
			}
		}
	}
);

$("#formulario-menu").validate(
	{
		rules:{
			idproduto:{
				required:true
			},
			valordesejado:{
				required:true
			},
			filtro:{
				required:true
			}
		},
		messages:{
			idproduto:{
				required:"Campo obrigatório",
			},
			valordesejado:{
				required:"Campo obrigatorio",
			},
			filtro:{
				required:"Campo obrigatório"
			}
		}
	}
);


function inicializarAlerta(){
	if(localStorage.getItem('alertas')==null){
		let alertas = [];
		localStorage.setItem('alertas', JSON.stringify(alertas));
	}
	if(localStorage.getItem('compras')==null){
		let compras = [];
		localStorage.setItem('compras', JSON.stringify(compras));
	}
	
	if(localStorage.getItem("usuarioAutenticado")!=null){
		window.location.href="menu.html";
	}
}

async function autenticar(event) {
	event.preventDefault();
	
	if($("#formulario").valid()) {
		let login = $("#login").val();
		let senha = $("#senha").val();

		try {
			let resposta = await fetch(`https://api-odinline.odiloncorrea.com/usuario/${login}/${senha}/autenticar`);
			let usuario = await resposta.json();
			console.log(usuario.id);
			if(usuario.id > 0) { 
				localStorage.setItem('usuarioAutenticado', JSON.stringify(usuario));
				window.location.href = "menu.html";
			} else {
				alert("Usuário ou senha inválidos.");
			}
		} catch(error) {
			console.log("Erro ao tentar autenticar." + " " + error);
		}
	}
}


function atualizarTabelaCompras(){
	let compras = JSON.parse(localStorage.getItem('compras'));
	let tabelaCompra = document.getElementById("tabela-compras");

	compras.forEach(compra =>{
		adicionarLinhaCompras(compra, tabelaCompra);
		console.log("entrou na tabela");
	})
}

async function atualizarTabela(){
	if(estaLogada()){
		try{
			let localStorageData = JSON.parse(localStorage.getItem('usuarioAutenticado'));
			let resposta = await fetch(`https://api-odinline.odiloncorrea.com/produto/${localStorageData.chave}/usuario`);
			let produtos = await resposta.json();
			
			let tabela = document.getElementById("tabela-produtos");

			produtos.forEach(produto => {
				adicionarLinha(produto, tabela);
			})
		}catch(error){
			console.log("Ocorreu algum erro " + error);
		}
		
	}else{
		alert("Você precisa estar logado para isso");
		window.location.href="index.html";
	}
}

function atualizarTabelaAlertas(){
	let alertas = JSON.parse(localStorage.getItem('alertas'));
	let tabelaAlertas = document.getElementById("tabela-alertas");

	alertas.forEach(alerta =>{
		adicionarLinhaAlertas(alerta, tabelaAlertas);
		console.log("entrou na tabela");
	})
}

function adicionarLinhaAlertas(alerta, tabela){
	let tbody = tabela.querySelector("tbody");
	let novaLinha = document.createElement("tr");

	let colunaId = document.createElement("td");
	colunaId.textContent = alerta.id_produto;
	novaLinha.appendChild(colunaId);

	let colunaTipo = document.createElement("td");
	colunaTipo.textContent = alerta.tipo_acao == 1 ? "Compra" : "Alerta";
	novaLinha.appendChild(colunaTipo);

	let colunaValor = document.createElement("td");
	colunaValor.textContent = alerta.valor_produto;
	novaLinha.appendChild(colunaValor);

	let colunaAtivo = document.createElement("td");
	let icone = document.createElement("i");

	if (alerta.valido) {
		icone.classList.add("bi", "bi-check-circle-fill", "text-success");
	} else {
		icone.classList.add("bi", "bi-x-circle-fill", "text-danger");
	}

	colunaAtivo.appendChild(icone);
	novaLinha.appendChild(colunaAtivo);

	tbody.appendChild(novaLinha);

}



function adicionarLinhaCompras(compra, tabela){

	let tbody = tabela.querySelector("tbody");

	let novaLinha = document.createElement("tr");

	let colunaId = document.createElement("td");
	colunaId.textContent = compra.id_produto;
	novaLinha.appendChild(colunaId);

	let colunaDescricao = document.createElement("td");
	colunaDescricao.textContent = compra.descricao_produto;
	novaLinha.appendChild(colunaDescricao);

	let colunaValor = document.createElement("td");
	colunaValor.textContent = compra.valor_produto;
	novaLinha.appendChild(colunaValor);


	tbody.appendChild(novaLinha);
}

function adicionarLinha(produto, tabela){
	let tbody = tabela.querySelector("tbody");

	let novaLinha = document.createElement("tr");

	let colunaId = document.createElement("td");
	colunaId.textContent = produto.id;
	novaLinha.appendChild(colunaId);


	let colunaDescricao = document.createElement("td");
	colunaDescricao.textContent = produto.descricao;
	novaLinha.appendChild(colunaDescricao);

	let colunaValor = document.createElement("td");
	colunaValor.textContent = produto.valor;
	novaLinha.appendChild(colunaValor);


	tbody.appendChild(novaLinha);
}

function estaLogada(){
	if(localStorage.getItem('usuarioAutenticado')==null)
		return false;
	return true;
}

function deslogar(){
	if(estaLogada()){
		localStorage.removeItem('usuarioAutenticado');
		alert("Deslogando!");
		window.location.href="index.html";
	}
}

async function cadastrarAlerta(){
	if($("#formulario-menu").valid()){
		let idProduto = parseInt(document.getElementById("idproduto").value);
		let valorProduto = parseFloat(document.getElementById("valordesejado").value);
		let filtro = parseInt(document.getElementById("filtro").value);
		
		let produto = await retornaProduto(idProduto);
		console.log(produto.id);
		if(produto.id!=null){
			console.log("produto existte!");
			let alertas = JSON.parse(localStorage.getItem('alertas'));
			
			if(validaAlerta(alertas, idProduto)){
				let alerta = new Alerta();
				alerta.id_produto = idProduto;
				alerta.valor_produto = valorProduto;
				alerta.tipo_acao = filtro;
				alerta.valido = true;

				alertas.push(alerta);
				localStorage.setItem('alertas', JSON.stringify(alertas));
				alert("Alerta gravado com sucesso!");
			}else{
				alert("Esse alerta já está ativo!");
			}
		}else{
			alert("Esse produto não existe");
		}
	}
	window.location.reload();
}

function validaAlerta(alertas, idProduto){
	for(let i = 0; i < alertas.length; i++){
		if(alertas[i].id_produto == idProduto && alertas[i].valido)
			return false;
	}

	return true;
}

async function retornaProduto(idProduto) {
	try {
		let resposta = await fetch(`https://api-odinline.odiloncorrea.com/produto/${idProduto}`);
		let produto = await resposta.json();
		console.log("Resposta da API:", produto); 

		return produto;
	} catch (error) {
		console.error("Erro ao capturar o produto:", error);
		return null;
	}
}


var interval = window.setInterval(verificaAlertas, 1000);
// Remover posicao do array de forma eficiente

async function verificaAlertas(){
	console.log("funcionando!");
	let alertas = JSON.parse(localStorage.getItem('alertas'));
	for(let i = 0; i < alertas.length; i++){
		if(alertas[i].valido){
			if(await comparaProduto(alertas[i].id_produto, alertas[i].valor_produto)){
				if(alertas[i].tipo_acao == 1){
					await cadastrarCompra(alertas[i].id_produto, alertas[i].valor_produto);
					alertas[i].valido = false;
				}else{
					alert("Produto de ID " + alertas[i].id_produto + " com valor abaixo ou menor do que o esperado!");
					alertas[i].valido = false;
				}
			}
		}
	}

	localStorage.setItem('alertas', JSON.stringify(alertas));

}

async function comparaProduto(idProduto, precoDesejado){
	let produto = await retornaProduto(idProduto);
	let preco = parseFloat(precoDesejado);
	let produtoPreco  = parseFloat(produto.valor);
	if(produtoPreco == preco)
		return true;
	return false;
}

async function cadastrarCompra(idProduto, valorCompra) {
	let compras = JSON.parse(localStorage.getItem('compras'));
	let compra = new Compra();
	let produto = await retornaProduto(idProduto);

	compra.id_produto = produto.id;
	compra.descricao_produto = produto.descricao;
	compra.valor_produto = valorCompra;

	compras.push(compra);
	localStorage.setItem('compras', JSON.stringify(compras));
}

