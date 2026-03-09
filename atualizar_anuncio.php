<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$id = isset($_POST['id']) ? $_POST['id'] : '';
$titulo = isset($_POST['titulo']) ? $_POST['titulo'] : '';
$descricao = isset($_POST['descricao']) ? $_POST['descricao'] : '';
$preco = isset($_POST['preco']) ? $_POST['preco'] : 0;
$local = isset($_POST['local']) ? $_POST['local'] : '';
$contato = isset($_POST['contato']) ? $_POST['contato'] : '';
$imagem_0 = isset($_POST['imagem_0']) ? $_POST['imagem_0'] : '';
$imagem_1 = isset($_POST['imagem_1']) ? $_POST['imagem_1'] : '';
$imagem_2 = isset($_POST['imagem_2']) ? $_POST['imagem_2'] : '';

if (!empty($id) && !empty($titulo)) {
    $id = $conexao->real_escape_string($id);
    $titulo = $conexao->real_escape_string($titulo);
    $descricao = $conexao->real_escape_string($descricao);
    $preco = $conexao->real_escape_string($preco);
    $local = $conexao->real_escape_string($local);
    $contato = $conexao->real_escape_string($contato);
    $imagem_0 = $conexao->real_escape_string($imagem_0);
    $imagem_1 = $conexao->real_escape_string($imagem_1);
    $imagem_2 = $conexao->real_escape_string($imagem_2);

    $sql = "UPDATE anuncios SET 
                titulo = '$titulo', 
                descricao = '$descricao', 
                preco = '$preco', 
                local = '$local', 
                contato = '$contato', 
                imagem_0 = '$imagem_0', 
                imagem_1 = '$imagem_1', 
                imagem_2 = '$imagem_2',
                status_aprovacao = 'pendente' 
            WHERE id = '$id'";
    
    if ($conexao->query($sql) === TRUE) {
        echo json_encode(array("status" => true, "mensagem" => "Anuncio atualizado com sucesso."));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Erro ao atualizar o anuncio."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "Dados incompletos."));
}
?>