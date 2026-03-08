<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if(!empty($dados->nome) && !empty($dados->email) && !empty($dados->senha)) {
    $nome = $conexao->real_escape_string($dados->nome);
    $email = $conexao->real_escape_string($dados->email);
    $senha = $conexao->real_escape_string($dados->senha);

    $sql = "INSERT INTO usuarios (nome, email, senha) VALUES ('$nome', '$email', '$senha')";

    if($conexao->query($sql) === TRUE) {
        echo json_encode(array("mensagem" => "Sucesso", "status" => true));
    } else {
        echo json_encode(array("mensagem" => "Erro", "status" => false));
    }
} else {
    echo json_encode(array("mensagem" => "Dados incompletos", "status" => false));
}
?>