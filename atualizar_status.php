<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id) && !empty($dados->status)) {
    $id = $conexao->real_escape_string($dados->id);
    $status = $conexao->real_escape_string($dados->status);

    $sql = "UPDATE anuncios SET status_aprovacao = '$status' WHERE id = '$id'";

    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("mensagem" => "Status atualizado com sucesso", "status" => true));
    } else {
        echo json_encode(array("mensagem" => "Erro ao atualizar", "status" => false));
    }
} else {
    echo json_encode(array("mensagem" => "Dados incompletos", "status" => false));
}
?>