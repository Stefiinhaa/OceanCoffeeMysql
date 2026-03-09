<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id)) {
    $id = $conexao->real_escape_string($dados->id);

    $sql = "UPDATE anuncios SET rejeicao_vista = 1 WHERE id = '$id'";
    $conexao->query($sql);
    
    echo json_encode(array("status" => true));
} else {
    echo json_encode(array("status" => false));
}
?>