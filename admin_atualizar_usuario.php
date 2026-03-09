<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id) && !empty($dados->nome) && !empty($dados->email)) {
    $id = $conexao->real_escape_string($dados->id);
    $nome = $conexao->real_escape_string($dados->nome);
    $email = $conexao->real_escape_string($dados->email);
    $tipo = isset($dados->tipo) ? $conexao->real_escape_string($dados->tipo) : 'Comum';

    $sql = "UPDATE usuarios SET nome = '$nome', email = '$email', tipo = '$tipo' WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Usuário atualizado com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao atualizar."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
}
?>