<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->nome) && !empty($dados->email) && !empty($dados->senha)) {
    $nome = $conexao->real_escape_string($dados->nome);
    $email = $conexao->real_escape_string($dados->email);
    $telefone = isset($dados->telefone) ? $conexao->real_escape_string($dados->telefone) : '';
    
    $senha_hash = password_hash($dados->senha, PASSWORD_DEFAULT); // Proteção da senha

    // Confere se o email já existe
    $check_email = $conexao->query("SELECT id FROM usuarios WHERE email = '$email'");
    if($check_email->num_rows > 0) {
        echo json_encode(array("status" => false, "mensagem" => "Este email já está cadastrado."));
        exit;
    }

    $sql = "INSERT INTO usuarios (nome, email, telefone, senha, tipo) VALUES ('$nome', '$email', '$telefone', '$senha_hash', 'Comum')";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Cadastro realizado com sucesso!"));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao cadastrar usuário."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
}
?>