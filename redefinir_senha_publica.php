<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->email) && !empty($dados->nova_senha)) {
    $email = $conexao->real_escape_string($dados->email);
    $senha_hash = password_hash($dados->nova_senha, PASSWORD_DEFAULT);

    $sql = "UPDATE usuarios SET senha = '$senha_hash' WHERE email = '$email'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Senha redefinida com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao redefinir a senha."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
}
?>