<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->email) && !empty($dados->senha)) {
    $email = $conexao->real_escape_string($dados->email);
    $senha = $dados->senha;

    $sql = "SELECT id, nome, email, senha, tipo, telefone FROM usuarios WHERE email = '$email'";
    $resultado = $conexao->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();
        
        // Verifica a senha (suporta o hash de novos cadastros e texto simples para o admin padrão)
        if (password_verify($senha, $usuario['senha']) || $senha === $usuario['senha']) {
            unset($usuario['senha']); // Remove a senha por segurança antes de enviar para o navegador
            echo json_encode(array("status" => true, "usuario" => $usuario));
        } else {
            echo json_encode(array("status" => false, "mensagem" => "Senha incorreta."));
        }
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Usuário não encontrado."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Preencha todos os campos."));
}
?>