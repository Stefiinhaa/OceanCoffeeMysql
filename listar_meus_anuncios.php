<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

$usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

if ($usuario_id > 0) {
    // Procura todos os anúncios deste utilizador e ordena dos mais recentes para os mais antigos
    $sql = "SELECT * FROM anuncios WHERE usuario_id = $usuario_id ORDER BY id DESC";
    $resultado = $conexao->query($sql);

    $produtos = array();

    if ($resultado && $resultado->num_rows > 0) {
        while($linha = $resultado->fetch_assoc()) {
            $produtos[] = $linha;
        }
        echo json_encode(array("status" => true, "produtos" => $produtos));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Nenhum anúncio encontrado."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "ID de utilizador inválido."));
}
?>