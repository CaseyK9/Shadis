<?php
session_start();

$uri_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = explode('/', trim($uri_path, '/'));
$file_data = null;

if (!empty($segments[0])) {
  if (strlen($segments[0]) === 8) {
    require_once "./protected/db.inc.php";
    $file_data = $db->request_file($segments[0]);
  }
}
?>
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/static/media/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="Web site created using create-react-app" />
  <link rel="apple-touch-icon" href="%PUBLIC_URL%/static/media/logo192.png" />
  <!--
    manifest.json provides metadata used when your web app is installed on a
    user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
  -->
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
  <!--
    Notice the use of %PUBLIC_URL% in the tags above.
    It will be replaced with the URL of the `public` folder during the build.
    Only files inside the `public` folder can be referenced from the HTML.

    Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
    work correctly both with client-side routing and a non-root public URL.
    Learn how to configure a non-root public URL by running `npm run build`.
  -->
  <title>Shadis</title>
  <?php
  if (isset($_SESSION["u_id"])) {
    $user_data = array("username" => $_SESSION["u_name"]);
    echo '<script>var userData = ';
    echo json_encode($user_data);
    echo '</script>';
  }
  if (!is_null($file_data)) :
    $file_data["fromServer"] = true;
    echo '<script>var fileData = ';
    echo json_encode($file_data);
    echo '</script>';
  ?>
    <style>
      #preContainer {
        position: fixed;
        padding-top: 64px;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        z-index: 60;
      }

      #preContainer img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    </style>
  <?php endif; ?>
</head>

<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  <?php if (!is_null($file_data)) : ?>
    <div id="preContainer">
      <img src="%PUBLIC_URL%/uploads/<?php echo $file_data["id"] . "." . $file_data["extension"] ?>" />
    </div>
  <?php endif; ?>
</body>

</html>