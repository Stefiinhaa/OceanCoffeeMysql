<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexao.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    // 1. Busca os dados do utilizador
    $sql_user = "SELECT nome, email, telefone FROM usuarios WHERE id = $id";
    $res_user = $conexao->query($sql_user);
    
    if ($res_user && $res_user->num_rows > 0) {
        $usuario = $res_user->fetch_assoc();
        
        // 2. Busca todos os anúncios deste utilizador (independentemente do estado)
        $sql_anuncios = "SELECT id, titulo, status_aprovacao, motivo_rejeicao, rejeicao_vista FROM anuncios WHERE usuario_id = $id ORDER BY id DESC";
        $res_anuncios = $conexao->query($sql_anuncios);
        
        $anuncios = array();
        if ($res_anuncios && $res_anuncios->num_rows > 0) {
            while($linha = $res_anuncios->fetch_assoc()) {
                $anuncios[] = $linha;
            }
        }
        
        echo json_encode(array("status" => true, "usuario" => $usuario, "anuncios" => $anuncios));
    } else {
        echo json_encode(array("status" => false, "mensagem" => "Utilizador não encontrado."));
    }
} else {
    echo json_encode(array("status" => false, "mensagem" => "ID inválido."));
}
?>