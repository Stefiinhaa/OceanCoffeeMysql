<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    // Procura o anúncio pelo ID, independentemente de estar aprovado, pendente ou rejeitado
    $sql = "SELECT * FROM anuncios WHERE id = $id";
    $resultado = $conexao->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        $produto = $resultado->fetch_assoc();
        echo json_encode(array("mensagem" => "Sucesso", "status" => true, "produto" => $produto));
    } else {
        echo json_encode(array("mensagem" => "Produto não encontrado", "status" => false));
    }
} else {
    echo json_encode(array("mensagem" => "ID inválido", "status" => false));
}
?>