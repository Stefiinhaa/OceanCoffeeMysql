<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    // Procura o anúncio e cruza (JOIN) com os dados do utilizador para obter o nome do vendedor
    $sql = "SELECT a.*, u.nome as nome_usuario FROM anuncios a LEFT JOIN usuarios u ON a.usuario_id = u.id WHERE a.id = $id AND a.status_aprovacao = 'aprovado'";
    $resultado = $conexao->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        $produto = $resultado->fetch_assoc();
        echo json_encode(array("mensagem" => "Sucesso", "status" => true, "produto" => $produto));
    } else {
        echo json_encode(array("mensagem" => "Produto nao encontrado", "status" => false));
    }
} else {
    echo json_encode(array("mensagem" => "ID invalido", "status" => false));
}
?>