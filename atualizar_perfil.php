<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id) && !empty($dados->nome)) {
    $id = $conexao->real_escape_string($dados->id);
    $nome = $conexao->real_escape_string($dados->nome);
    $telefone = isset($dados->telefone) ? $conexao->real_escape_string($dados->telefone) : '';

    $sql = "UPDATE usuarios SET nome = '$nome', telefone = '$telefone' WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Perfil atualizado com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao atualizar o perfil."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
}
?>