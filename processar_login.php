<?php
// Bloqueia erros feios em HTML
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    include_once 'conexao.php';

    $dados = json_decode(file_get_contents("php://input"));

    if (!empty($dados->email) && !empty($dados->senha)) {
        $email = $conexao->real_escape_string($dados->email);
        $senha = $dados->senha;

        $sql = "SELECT id, nome, email, senha, tipo, telefone FROM usuarios WHERE email = '$email'";
        $resultado = $conexao->query($sql);

        if ($resultado && $resultado->num_rows > 0) {
            $usuario = $resultado->fetch_assoc();
            
            if (password_verify($senha, $usuario['senha']) || $senha === $usuario['senha']) {
                unset($usuario['senha']);
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
} catch (Exception $e) {
    // Se a base de dados falhar, envia o erro para o pop-up vermelho!
    echo json_encode(array("status" => false, "mensagem" => "Erro no servidor: " . $e->getMessage()));
}
?>