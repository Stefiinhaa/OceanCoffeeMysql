<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id)) {
    $id = $conexao->real_escape_string($dados->id);
    
    // Atualiza APENAS a coluna vendido para 1 (true)
    $sql = "UPDATE anuncios SET vendido = 1 WHERE id = '$id'";

    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("mensagem" => "Produto marcado como vendido!", "status" => true));
    } else {
        echo json_encode(array("mensagem" => "Erro ao marcar como vendido", "status" => false));
    }
} else {
    echo json_encode(array("mensagem" => "ID do anúncio não fornecido", "status" => false));
}
?>