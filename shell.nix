let _pkgs = import <nixpkgs> { };
in { pkgs ? import (_pkgs.fetchFromGitHub {
  owner = "NixOS";
  repo = "nixpkgs-channels";
  #branch@date: nixpkgs-unstable@2020-04-23
  rev = "b95699970fb7d825fd4a710f5cfa3785a98435db";
  sha256 = "0s9pjym3wi3ssp33cd2sj8fs9dlny5yhc7lhnj2lzadx8ianbf72";
}) { } }:

with pkgs;

mkShell {
  buildInputs = [
    nodePackages.prettier
  ];
}
