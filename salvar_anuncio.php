<?php
// Esconde erros em formato HTML para não quebrar o sistema
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// O bloco TRY funciona como um para-quedas. Tenta executar, se falhar, cai no CATCH.
try {
    include_once 'conexao.php';

    $usuario_id = isset($_POST['usuario_id']) ? $_POST['usuario_id'] : '';
    $titulo = isset($_POST['titulo']) ? $_POST['titulo'] : '';
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : '';
    $preco = isset($_POST['preco']) ? $_POST['preco'] : 0;
    $local = isset($_POST['local']) ? $_POST['local'] : '';
    $contato = isset($_POST['contato']) ? $_POST['contato'] : '';

    $imagem_0 = isset($_POST['imagem_0']) ? $_POST['imagem_0'] : '';
    $imagem_1 = isset($_POST['imagem_1']) ? $_POST['imagem_1'] : '';
    $imagem_2 = isset($_POST['imagem_2']) ? $_POST['imagem_2'] : '';

    if (!empty($usuario_id) && !empty($titulo)) {
        $usuario_id = $conexao->real_escape_string($usuario_id);
        $titulo = $conexao->real_escape_string($titulo);
        $descricao = $conexao->real_escape_string($descricao);
        $preco = $conexao->real_escape_string($preco);
        $local = $conexao->real_escape_string($local);
        $contato = $conexao->real_escape_string($contato);
        $imagem_0 = $conexao->real_escape_string($imagem_0);
        $imagem_1 = $conexao->real_escape_string($imagem_1);
        $imagem_2 = $conexao->real_escape_string($imagem_2);

        $sql = "INSERT INTO anuncios (usuario_id, titulo, descricao, preco, local, contato, imagem_0, imagem_1, imagem_2, status_aprovacao) 
                VALUES ('$usuario_id', '$titulo', '$descricao', '$preco', '$local', '$contato', '$imagem_0', '$imagem_1', '$imagem_2', 'pendente')";
        
        if ($conexao->query($sql) === TRUE) {
            echo json_encode(array("status" => true, "mensagem" => "Anúncio criado com sucesso!"));
        } else {
            // Se o MySQL recusar o texto, devolve a justificação exata
            echo json_encode(array("status" => false, "mensagem" => "Erro na base de dados: " . $conexao->error));
        }
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Dados incompletos. As imagens podem estar a exceder o limite do PHP."));
    }

} catch (Exception $e) {
    // Se o PHP crashar, captura o erro e envia para o Pop-up
    echo json_encode(array("status" => false, "mensagem" => "Erro interno no servidor: " . $e->getMessage()));
}
?>