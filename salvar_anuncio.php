<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$titulo = $_POST['titulo'] ?? '';
$descricao = $_POST['descricao'] ?? '';
$preco = $_POST['preco'] ?? '';
$usuario_id = $_POST['usuario_id'] ?? 1;
$imagem_0 = $_POST['imagem_0'] ?? '';
$imagem_1 = $_POST['imagem_1'] ?? '';
$imagem_2 = $_POST['imagem_2'] ?? '';

$titulo = $conexao->real_escape_string($titulo);
$descricao = $conexao->real_escape_string($descricao);
$preco = $conexao->real_escape_string($preco);
$usuario_id = $conexao->real_escape_string($usuario_id);

$sql = "INSERT INTO anuncios (usuario_id, titulo, descricao, preco, imagem_0, imagem_1, imagem_2, status_aprovacao) VALUES ('$usuario_id', '$titulo', '$descricao', '$preco', '$imagem_0', '$imagem_1', '$imagem_2', 'pendente')";

if($conexao->query($sql) === TRUE) {
    echo json_encode(array("mensagem" => "Sucesso", "status" => true));
} else {
    echo json_encode(array("mensagem" => "Erro na gravacao", "status" => false));
}
?>