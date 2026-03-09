<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id) && !empty($dados->nova_senha)) {
    $id = $conexao->real_escape_string($dados->id);
    $nova_senha = $conexao->real_escape_string($dados->nova_senha);

    $sql = "UPDATE usuarios SET senha = '$nova_senha' WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Senha alterada com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao alterar a senha."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
}
?>